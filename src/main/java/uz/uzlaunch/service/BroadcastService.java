package uz.uzlaunch.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.uzlaunch.exception.BadRequestException;
import uz.uzlaunch.exception.ForbiddenException;
import uz.uzlaunch.model.Broadcast;
import uz.uzlaunch.model.Project;
import uz.uzlaunch.model.Subscriber;
import uz.uzlaunch.model.User;
import uz.uzlaunch.repository.BroadcastRepository;
import uz.uzlaunch.repository.SubscriberRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BroadcastService {

    private static final int RATE_LIMIT_PER_DAY = 5;
    private static final int SYNC_THRESHOLD = 100;

    private final BroadcastRepository broadcastRepo;
    private final SubscriberRepository subscriberRepo;
    private final ProjectService projectService;
    private final EmailService emailService;
    private final WebhookService webhookService;

    public List<Broadcast> list(Long projectId, User user) {
        Project p = projectService.getOwned(projectId, user);
        return broadcastRepo.findByProjectOrderBySentAtDesc(p);
    }

    @Transactional
    public Broadcast send(Long projectId, User user, String subject, String body) {
        if (user.getPlan() != User.Plan.PAID)
            throw new ForbiddenException("Email broadcasts require Pro plan");
        if (subject == null || subject.isBlank()) throw new BadRequestException("Subject is required");
        if (body == null || body.isBlank()) throw new BadRequestException("Body is required");
        if (subject.length() > 200) throw new BadRequestException("Subject must be under 200 characters");
        if (body.length() > 10000) throw new BadRequestException("Body must be under 10000 characters");

        Project p = projectService.getOwned(projectId, user);

        long sentToday = broadcastRepo.countByProjectAndSentAtAfter(p, LocalDateTime.now().minusDays(1));
        if (sentToday >= RATE_LIMIT_PER_DAY)
            throw new BadRequestException("Daily broadcast limit reached (" + RATE_LIMIT_PER_DAY + "/day). Try again tomorrow.");

        List<Subscriber> recipients = subscriberRepo.findByProjectAndConfirmed(p, true);
        if (recipients.isEmpty()) throw new BadRequestException("No confirmed subscribers to send to");

        Broadcast b = new Broadcast();
        b.setProject(p);
        b.setSubject(subject.trim());
        b.setBody(body.trim());
        b.setSentAt(LocalDateTime.now());
        b.setRecipientCount(recipients.size());
        broadcastRepo.save(b);

        if (recipients.size() <= SYNC_THRESHOLD) {
            emailService.sendProjectBroadcastBatch(recipients, p.getName(), p.getSlug(), b.getSubject(), b.getBody());
        } else {
            dispatchAsync(recipients, p.getName(), p.getSlug(), b.getSubject(), b.getBody());
        }
        webhookService.dispatch(p, uz.uzlaunch.model.Webhook.EVT_BROADCAST_SENT, java.util.Map.of(
            "subject", b.getSubject(),
            "recipientCount", b.getRecipientCount(),
            "projectSlug", p.getSlug()
        ));
        return b;
    }

    @org.springframework.scheduling.annotation.Async
    public void dispatchAsync(List<Subscriber> recipients, String projectName, String projectSlug, String subject, String body) {
        int chunkSize = 50;
        for (int i = 0; i < recipients.size(); i += chunkSize) {
            List<Subscriber> chunk = recipients.subList(i, Math.min(i + chunkSize, recipients.size()));
            emailService.sendProjectBroadcastBatch(chunk, projectName, projectSlug, subject, body);
        }
    }
}
