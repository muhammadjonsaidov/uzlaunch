package uz.uzlaunch.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.uzlaunch.model.Project;
import uz.uzlaunch.model.Subscriber;
import uz.uzlaunch.repository.ProjectRepository;
import uz.uzlaunch.repository.SubscriberRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class LaunchSchedulerService {

    private final ProjectRepository projectRepo;
    private final SubscriberRepository subscriberRepo;
    private final EmailService emailService;

    @Scheduled(fixedDelay = 10_000)
    @Transactional
    public void checkAndNotify() {
        LocalDateTime now = LocalDateTime.now();
        List<Project> due = projectRepo.findByLaunchAtBeforeAndLaunchNotifiedFalse(now);
        log.info("Launch scheduler tick: now={}, due={}", now, due.size());
        for (Project p : due) {
            log.info("Sending launch notifications for project '{}' (id={})", p.getName(), p.getId());
            List<Subscriber> confirmed = subscriberRepo.findByProjectAndConfirmed(p, true);
            log.info("Launch notification for '{}': sending to {} subscribers", p.getName(), confirmed.size());
            emailService.sendLaunchAnnouncementBatch(confirmed, p.getName(), p.getSlug(),
                p.getLaunchEmailSubject(), p.getLaunchEmailBody());
            p.setLaunchNotified(true);
            projectRepo.save(p);
        }
    }
}
