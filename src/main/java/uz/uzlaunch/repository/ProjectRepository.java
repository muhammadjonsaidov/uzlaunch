package uz.uzlaunch.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import uz.uzlaunch.model.Project;
import uz.uzlaunch.model.User;
import java.util.List;
import java.util.Optional;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    Optional<Project> findBySlug(String slug);
    List<Project> findByUser(User user);
    boolean existsBySlug(String slug);
}
