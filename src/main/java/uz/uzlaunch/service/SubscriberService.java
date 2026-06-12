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
        sub.setConfirmed(false);
        subscriberRepo.save(sub);

        emailService.sendSubscriberConfirmation(email, req.getName(), project.getName(), project.getSlug(), sub.getToken());
    }

    public record ConfirmResult(String slug, long position, long total) {}

    @Transactional
    public ConfirmResult confirmSubscription(String token) {
        Subscriber sub = subscriberRepo.findByToken(token).orElseThrow(PageNotFoundException::new);
        Project p = sub.getProject();
        String slug = p.getSlug();

        if (sub.isConfirmed()) {
            long position = subscriberRepo.countConfirmedAtOrBefore(p, sub.getConfirmedAt());
            long total = subscriberRepo.countByProjectAndConfirmed(p, true);
            return new ConfirmResult(slug, position, total);
        }

        if (!sub.getSubscribedAt().isAfter(LocalDateTime.now().minusDays(7))) {
            subscriberRepo.delete(sub);
            throw new PageNotFoundException();
        }

        sub.setConfirmed(true);
        sub.setConfirmedAt(LocalDateTime.now());
        subscriberRepo.save(sub);

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

        long position = subscriberRepo.countConfirmedAtOrBefore(p, sub.getConfirmedAt());
        return new ConfirmResult(slug, position, newCount);
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
        String projectName = sub.getProject().getName();
        if (sub.isConfirmed()) {
            projectRepo.decrementSubscriberCount(sub.getProject().getId());
        }
        subscriberRepo.delete(sub);
        scoreService.recompute(sub.getProject());
        return projectName;
    }
}
