package uz.uzlaunch.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.uzlaunch.dto.SubscribeRequest;
import uz.uzlaunch.exception.AlreadySubscribedException;
import uz.uzlaunch.exception.AwaitingConfirmationException;
import uz.uzlaunch.exception.PageNotFoundException;
import uz.uzlaunch.exception.SubscribeRateLimitedException;
import uz.uzlaunch.model.Project;
import uz.uzlaunch.model.Subscriber;
import uz.uzlaunch.repository.ProjectRepository;
import uz.uzlaunch.repository.SubscriberRepository;

import java.util.Optional;
import java.util.UUID;

@Service
public class SubscriberService {

    @Autowired private ProjectRepository projectRepo;
    @Autowired private SubscriberRepository subscriberRepo;
    @Autowired private EmailService emailService;
    @Autowired private SseService sseService;

    @Autowired
    @Qualifier("subscribeRateLimiter")
    private RateLimiter rateLimiter;

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
        sub.setConfirmed(false);
        subscriberRepo.save(sub);

        emailService.sendSubscriberConfirmation(email, req.getName(), project.getName(), project.getSlug(), sub.getToken());
    }

    @Transactional
    public String confirmSubscription(String token) {
        Subscriber sub = subscriberRepo.findByToken(token).orElseThrow(PageNotFoundException::new);
        String slug = sub.getProject().getSlug();
        if (sub.isConfirmed()) return slug;

        if (sub.getSubscribedAt().isBefore(java.time.LocalDateTime.now().minusDays(7))) {
            subscriberRepo.delete(sub);
            throw new uz.uzlaunch.exception.PageNotFoundException();
        }

        sub.setConfirmed(true);
        sub.setConfirmedAt(java.time.LocalDateTime.now());
        subscriberRepo.save(sub);

        Project p = sub.getProject();
        projectRepo.incrementSubscriberCount(p.getId());
        int newCount = p.getSubscriberCount() + 1;
        sseService.broadcast(p.getId(), newCount);

        emailService.sendSubscriptionConfirmed(sub.getEmail(), sub.getName(), p.getName(), p.getSlug(), sub.getToken(),
            p.getConfirmEmailSubject(), p.getConfirmEmailBody());
        emailService.sendOwnerNotification(
            p.getUser().getEmail(), p.getUser().getName(),
            sub.getEmail(), sub.getName(), p.getName(), newCount
        );

        return slug;
    }

    @Transactional
    public void deleteSubscriber(Long subId, Project project) {
        Subscriber sub = subscriberRepo.findByIdAndProject(subId, project)
            .orElseThrow(uz.uzlaunch.exception.PageNotFoundException::new);
        if (sub.isConfirmed()) {
            projectRepo.decrementSubscriberCount(project.getId());
        }
        subscriberRepo.delete(sub);
    }

    public void resendConfirmation(Long subId, Project project) {
        Subscriber sub = subscriberRepo.findByIdAndProject(subId, project)
            .orElseThrow(uz.uzlaunch.exception.PageNotFoundException::new);
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
        return projectName;
    }
}
