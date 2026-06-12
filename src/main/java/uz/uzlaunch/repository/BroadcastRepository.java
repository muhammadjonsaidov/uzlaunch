package uz.uzlaunch.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import uz.uzlaunch.model.Broadcast;
import uz.uzlaunch.model.Project;

import java.time.LocalDateTime;
import java.util.List;

public interface BroadcastRepository extends JpaRepository<Broadcast, Long> {
    List<Broadcast> findByProjectOrderBySentAtDesc(Project project);
    long countByProjectAndSentAtAfter(Project project, LocalDateTime after);
}
