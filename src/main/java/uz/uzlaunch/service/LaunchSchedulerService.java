package uz.uzlaunch.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
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
public class LaunchSchedulerService {

    private static final Logger log = LoggerFactory.getLogger(LaunchSchedulerService.class);

    @Autowired private ProjectRepository projectRepo;
    @Autowired private SubscriberRepository subscriberRepo;
    @Autowired private EmailService emailService;

    @Scheduled(fixedDelay = 60_000)
    @Transactional
    public void checkAndNotify() {
        LocalDateTime now = LocalDateTime.now();
        List<Project> due = projectRepo.findByLaunchAtBeforeAndLaunchNotifiedFalse(now);
        log.info("Launch scheduler tick: now={}, due={}", now, due.size());
        for (Project p : due) {
            log.info("Sending launch notifications for project '{}' (id={})", p.getName(), p.getId());
            List<Subscriber> confirmed = subscriberRepo.findByProjectAndConfirmed(p, true);
            log.info("Launch notification for '{}': sending to {} subscribers", p.getName(), confirmed.size());
            for (Subscriber s : confirmed) {
                emailService.sendLaunchAnnouncement(s.getEmail(), s.getName(), p.getName(), p.getSlug(), s.getToken());
            }
            p.setLaunchNotified(true);
            projectRepo.save(p);
        }
    }
}
