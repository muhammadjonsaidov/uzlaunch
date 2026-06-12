package uz.uzlaunch.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.uzlaunch.dto.SubscribeRequest;
import uz.uzlaunch.exception.*;
import uz.uzlaunch.model.Project;
import uz.uzlaunch.model.Subscriber;
import uz.uzlaunch.repository.ProjectRepository;
import uz.uzlaunch.repository.SubscriberRepository;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SubscriberService {

    private final ProjectRepository projectRepo;
    private final SubscriberRepository subscriberRepo;
    private final EmailService emailService;
    private final SseService sseService;
    private final @Qualifier("subscribeRateLimiter") RateLimiter rateLimiter;
    private final ValidationScoreService scoreService;
    private final WebhookService webhookService;

    public void subscribe(String slug, SubscribeRequest req, String ip) {
        if (!rateLimiter.isAllowed(ip + ":" + slug))
            throw new SubscribeRateLimitedException(slug);

        Project project = projectRepo.findBySlug(slug).orElseThrow(PageNotFoundException::new);
        String email = req.getEmail().trim().toLowerCase();

        Optional<Subscriber> existing = subscriberRepo.findByProjectAndEmail(project, email);
        if (existing.isPresent()) {
            if (existing.get().isConfirmed()) throw new AlreadySubscribedException(slug);
            else throw new AwaitingConfirmationException(slug);
        }

        Subscriber sub = new Subscriber();
        sub.setProject(project);
        sub.setEmail(email);
        if (req.getName() != null && !req.getName().isBlank()) sub.setName(req.getName().trim());
        sub.setToken(UUID.randomUUID().toString());
        if (req.getCommitment() != null && !req.getCommitment().isBlank()) {
            try { sub.setCommitment(Subscriber.Commitment.valueOf(req.getCommitment().toUpperCase())); }
            catch (IllegalArgumentException ignored) {}
        }
        if (req.getFeedbackAnswer() != null && !req.getFeedbackAnswer().isBlank())
            sub.setFeedbackAnswer(req.getFeedbackAnswer().trim());
        if (req.getRef() != null && !req.getRef().isBlank()) {
            subscriberRepo.findByReferralCode(req.getRef().trim()).ifPresent(referrer -> {
                if (referrer.getProject().getId().equals(project.getId())
                        && !referrer.getEmail().equalsIgnoreCase(email)) {
                    sub.setReferredById(referrer.getId());
                }
            });
        }
        sub.setUtmSource(trimUtm(req.getUtmSource()));
        sub.setUtmMedium(trimUtm(req.getUtmMedium()));
        sub.setUtmCampaign(trimUtm(req.getUtmCampaign()));
        sub.setConfirmed(false);
        subscriberRepo.save(sub);

        emailService.sendSubscriberConfirmation(email, req.getName(), project.getName(), project.getSlug(), sub.getToken());
        webhookService.dispatch(project, uz.uzlaunch.model.Webhook.EVT_SUB_CREATED, java.util.Map.of(
            "email", sub.getEmail(),
            "name", sub.getName() == null ? "" : sub.getName(),
            "commitment", sub.getCommitment().name(),
            "utmSource", sub.getUtmSource() == null ? "" : sub.getUtmSource(),
            "projectSlug", project.getSlug()
        ));
    }

    public record ConfirmResult(String slug, long position, long total, String referralCode) {}

    @Transactional
    public ConfirmResult confirmSubscription(String token) {
        Subscriber sub = subscriberRepo.findByToken(token).orElseThrow(PageNotFoundException::new);
        Project p = sub.getProject();
        String slug = p.getSlug();

        if (sub.isConfirmed()) {
            if (sub.getReferralCode() == null) {
                sub.setReferralCode(generateReferralCode());
                subscriberRepo.save(sub);
            }
            return new ConfirmResult(slug, rankOf(sub), subscriberRepo.countByProjectAndConfirmed(p, true), sub.getReferralCode());
        }

        if (!sub.getSubscribedAt().isAfter(LocalDateTime.now().minusDays(7))) {
            subscriberRepo.delete(sub);
            throw new PageNotFoundException();
        }

        sub.setConfirmed(true);
        sub.setConfirmedAt(LocalDateTime.now());
        if (sub.getReferralCode() == null) sub.setReferralCode(generateReferralCode());
        subscriberRepo.save(sub);

        if (sub.getReferredById() != null) {
            subscriberRepo.findById(sub.getReferredById()).ifPresent(referrer -> {
                if (referrer.isConfirmed()) subscriberRepo.incrementReferralCount(referrer.getId());
            });
        }

        projectRepo.incrementSubscriberCount(p.getId());
        int newCount = p.getSubscriberCount() + 1;
        sseService.broadcast(p.getId(), newCount);
        scoreService.recompute(p);

        emailService.sendSubscriptionConfirmed(sub.getEmail(), sub.getName(), p.getName(), p.getSlug(), sub.getToken(),
            p.getConfirmEmailSubject(), p.getConfirmEmailBody());
        emailService.sendOwnerNotification(
            p.getUser().getEmail(), p.getUser().getName(),
            sub.getEmail(), sub.getName(), p.getName(), newCount
        );
        webhookService.dispatch(p, uz.uzlaunch.model.Webhook.EVT_SUB_CONFIRMED, java.util.Map.of(
            "email", sub.getEmail(),
            "name", sub.getName() == null ? "" : sub.getName(),
            "commitment", sub.getCommitment().name(),
            "referralCode", sub.getReferralCode() == null ? "" : sub.getReferralCode(),
            "projectSlug", p.getSlug(),
            "totalConfirmed", newCount
        ));

        return new ConfirmResult(slug, rankOf(sub), newCount, sub.getReferralCode());
    }

    private long rankOf(Subscriber sub) {
        return subscriberRepo.countAhead(sub.getProject(), sub.getReferralCount(), sub.getConfirmedAt()) + 1;
    }

    private String trimUtm(String v) {
        if (v == null) return null;
        String t = v.trim();
        if (t.isEmpty()) return null;
        return t.length() > 100 ? t.substring(0, 100) : t;
    }

    private String generateReferralCode() {
        String alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        java.security.SecureRandom rng = new java.security.SecureRandom();
        for (int attempt = 0; attempt < 5; attempt++) {
            StringBuilder sb = new StringBuilder(8);
            for (int i = 0; i < 8; i++) sb.append(alphabet.charAt(rng.nextInt(alphabet.length())));
            String code = sb.toString();
            if (!subscriberRepo.existsByReferralCode(code)) return code;
        }
        return UUID.randomUUID().toString().replace("-", "").substring(0, 12);
    }

    @Transactional
    public void deleteSubscriber(Long subId, Project project) {
        Subscriber sub = subscriberRepo.findByIdAndProject(subId, project)
            .orElseThrow(PageNotFoundException::new);
        if (sub.isConfirmed()) {
            projectRepo.decrementSubscriberCount(project.getId());
        }
        subscriberRepo.delete(sub);
    }

    public void resendConfirmation(Long subId, Project project) {
        Subscriber sub = subscriberRepo.findByIdAndProject(subId, project)
            .orElseThrow(PageNotFoundException::new);
        if (!sub.isConfirmed()) {
            emailService.sendSubscriberConfirmation(sub.getEmail(), sub.getName(),
                project.getName(), project.getSlug(), sub.getToken());
        }
    }

    @Transactional
    public String unsubscribe(String token) {
        Subscriber sub = subscriberRepo.findByToken(token).orElseThrow(PageNotFoundException::new);
        Project project = sub.getProject();
        String projectName = project.getName();
        String email = sub.getEmail();
        if (sub.isConfirmed()) {
            projectRepo.decrementSubscriberCount(project.getId());
        }
        subscriberRepo.delete(sub);
        scoreService.recompute(project);
        webhookService.dispatch(project, uz.uzlaunch.model.Webhook.EVT_SUB_UNSUBSCRIBED, java.util.Map.of(
            "email", email,
            "projectSlug", project.getSlug()
        ));
        return projectName;
    }
}
