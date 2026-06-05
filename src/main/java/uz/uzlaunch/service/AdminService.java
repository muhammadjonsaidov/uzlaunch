package uz.uzlaunch.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.uzlaunch.model.Project;
import uz.uzlaunch.model.User;
import uz.uzlaunch.repository.ProjectRepository;
import uz.uzlaunch.repository.SubscriberRepository;
import uz.uzlaunch.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AdminService {

    @Autowired private UserRepository userRepo;
    @Autowired private ProjectRepository projectRepo;
    @Autowired private SubscriberRepository subscriberRepo;

    public record AdminStats(
        long userCount,
        long projectCount,
        long subscriberCount,
        long todaySignups,
        List<User> users,
        List<Project> projects
    ) {}

    public AdminStats getStats() {
        LocalDateTime startOfDay = LocalDateTime.now().toLocalDate().atStartOfDay();
        long todaySignups = userRepo.countByCreatedAtAfter(startOfDay);
        return new AdminStats(
            userRepo.count(),
            projectRepo.count(),
            subscriberRepo.countByConfirmed(true),
            todaySignups,
            userRepo.findAll(Sort.by(Sort.Direction.DESC, "createdAt")),
            projectRepo.findAll(Sort.by(Sort.Direction.DESC, "createdAt"))
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

    @Transactional
    public String deleteUser(String id) {
        User user = userRepo.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("User not found: " + id));
        List<Project> projects = projectRepo.findByUser(user);
        for (Project p : projects) {
            subscriberRepo.deleteByProject(p);
        }
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
}
