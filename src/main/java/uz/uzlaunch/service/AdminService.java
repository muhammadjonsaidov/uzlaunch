package uz.uzlaunch.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.uzlaunch.model.Project;
import uz.uzlaunch.model.Subscriber;
import uz.uzlaunch.model.User;
import uz.uzlaunch.repository.ProjectRepository;
import uz.uzlaunch.repository.SubscriberRepository;
import uz.uzlaunch.repository.UserRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepo;
    private final ProjectRepository projectRepo;
    private final SubscriberRepository subscriberRepo;
    private final EmailService emailService;
    private final SseService sseService;
    private final ValidationScoreService scoreService;

    public record DailyCount(String date, long count) {}

    public record AdminStats(
        long userCount,
        long projectCount,
        long subscriberCount,
        long todaySignups,
        List<User> users,
        List<Project> projects,
        List<DailyCount> dailySignups,
        List<Project> topProjects,
        Map<Long, Long> pendingByProject,
        List<Subscriber> pendingSubscribers
    ) {}

    public AdminStats getStats() {
        LocalDateTime startOfDay = LocalDateTime.now().toLocalDate().atStartOfDay();
        LocalDateTime since7Days = LocalDate.now().minusDays(6).atStartOfDay();

        Map<LocalDate, Long> countByDay = userRepo.findByCreatedAtAfter(since7Days).stream()
            .collect(Collectors.groupingBy(u -> u.getCreatedAt().toLocalDate(), Collectors.counting()));

        List<DailyCount> daily = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate day = LocalDate.now().minusDays(i);
            daily.add(new DailyCount(day.toString(), countByDay.getOrDefault(day, 0L)));
        }

        Map<Long, Long> pendingByProject = new HashMap<>();
        for (Object[] row : subscriberRepo.countPendingGroupByProject()) {
            pendingByProject.put((Long) row[0], (Long) row[1]);
        }

        return new AdminStats(
            userRepo.count(),
            projectRepo.count(),
            subscriberRepo.count(),
            userRepo.countByCreatedAtAfter(startOfDay),
            userRepo.findAll(Sort.by(Sort.Direction.DESC, "createdAt")),
            projectRepo.findAll(Sort.by(Sort.Direction.DESC, "createdAt")),
            daily,
            projectRepo.findTop5ByOrderBySubscriberCountDesc(),
            pendingByProject,
            subscriberRepo.findPendingWithProject()
        );
    }

    public String upgradeUser(String id) {
        User user = userRepo.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("User not found: " + id));
        user.setPlan(User.Plan.PAID);
        userRepo.save(user);
        return user.getEmail();
    }

    public String downgradeUser(String id) {
        User user = userRepo.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("User not found: " + id));
        user.setPlan(User.Plan.FREE);
        userRepo.save(user);
        return user.getEmail();
    }

    public String banUser(String id) {
        User user = userRepo.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("User not found: " + id));
        user.setBanned(true);
        userRepo.save(user);
        return user.getEmail();
    }

    public String unbanUser(String id) {
        User user = userRepo.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("User not found: " + id));
        user.setBanned(false);
        userRepo.save(user);
        return user.getEmail();
    }

    @Transactional
    public String deleteUser(String id) {
        User user = userRepo.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("User not found: " + id));
        List<Project> projects = projectRepo.findByUser(user);
        for (Project p : projects) subscriberRepo.deleteByProject(p);
        projectRepo.deleteAll(projects);
        userRepo.delete(user);
        return user.getEmail();
    }

    @Transactional
    public String deleteProject(Long id) {
        Project project = projectRepo.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Project not found: " + id));
        subscriberRepo.deleteByProject(project);
        projectRepo.delete(project);
        return project.getName();
    }

    @Transactional
    public String confirmSubscriber(Long id) {
        Subscriber sub = subscriberRepo.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Subscriber not found: " + id));
        if (sub.isConfirmed()) return sub.getEmail();
        sub.setConfirmed(true);
        subscriberRepo.save(sub);
        projectRepo.incrementSubscriberCount(sub.getProject().getId());
        sseService.broadcast(sub.getProject().getId(), sub.getProject().getSubscriberCount() + 1);
        scoreService.recompute(sub.getProject());
        return sub.getEmail();
    }

    @Transactional
    public String deletePendingSubscriber(Long id) {
        Subscriber sub = subscriberRepo.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Subscriber not found: " + id));
        String email = sub.getEmail();
        subscriberRepo.delete(sub);
        return email;
    }

    public int broadcastEmail(String subject, String body) {
        List<String> emails = userRepo.findAll().stream()
            .filter(u -> !u.isBanned())
            .map(User::getEmail)
            .toList();
        return emailService.broadcastToUsers(emails, subject, body);
    }

    @Transactional(readOnly = true)
    public String exportUsersCsv() {
        StringBuilder sb = new StringBuilder("id,email,name,plan,banned,created_at\n");
        for (User u : userRepo.findAll(Sort.by(Sort.Direction.DESC, "createdAt"))) {
            sb.append(csv(u.getId())).append(',')
              .append(csv(u.getEmail())).append(',')
              .append(csv(u.getName())).append(',')
              .append(u.getPlan()).append(',')
              .append(u.isBanned()).append(',')
              .append(u.getCreatedAt()).append('\n');
        }
        return sb.toString();
    }

    @Transactional(readOnly = true)
    public String exportSubscribersCsv() {
        StringBuilder sb = new StringBuilder("project_slug,project_name,email,name,confirmed,subscribed_at\n");
        for (Subscriber s : subscriberRepo.findAll(Sort.by(Sort.Direction.DESC, "subscribedAt"))) {
            sb.append(csv(s.getProject().getSlug())).append(',')
              .append(csv(s.getProject().getName())).append(',')
              .append(csv(s.getEmail())).append(',')
              .append(csv(s.getName())).append(',')
              .append(s.isConfirmed()).append(',')
              .append(s.getSubscribedAt()).append('\n');
        }
        return sb.toString();
    }

    private String csv(String val) {
        if (val == null) return "";
        return "\"" + val.replace("\"", "\"\"") + "\"";
    }
}
