package uz.uzlaunch.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import uz.uzlaunch.model.User;
import uz.uzlaunch.repository.ProjectRepository;
import uz.uzlaunch.repository.SubscriberRepository;
import uz.uzlaunch.repository.UserRepository;

import java.util.List;

@Service
public class AdminService {

    @Autowired private UserRepository userRepo;
    @Autowired private ProjectRepository projectRepo;
    @Autowired private SubscriberRepository subscriberRepo;

    public record AdminStats(long userCount, long projectCount, long subscriberCount, List<User> users) {}

    public AdminStats getStats() {
        long confirmedSubs = subscriberRepo.countByConfirmed(true);
        return new AdminStats(
            userRepo.count(),
            projectRepo.count(),
            confirmedSubs,
            userRepo.findAll(Sort.by(Sort.Direction.DESC, "createdAt"))
        );
    }

    public String upgradeUser(String id) {
        User user = userRepo.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("User not found: " + id));
        user.setPlan(User.Plan.PAID);
        userRepo.save(user);
        return user.getEmail();
    }
}
