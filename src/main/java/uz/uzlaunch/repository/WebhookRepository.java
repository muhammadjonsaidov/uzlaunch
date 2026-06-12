package uz.uzlaunch.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import uz.uzlaunch.model.Project;
import uz.uzlaunch.model.Webhook;

import java.util.List;
import java.util.Optional;

public interface WebhookRepository extends JpaRepository<Webhook, Long> {
    List<Webhook> findByProjectOrderByCreatedAtDesc(Project project);
    List<Webhook> findByProjectAndActiveTrue(Project project);
    Optional<Webhook> findByIdAndProject(Long id, Project project);
    long countByProject(Project project);
}
