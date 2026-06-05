package uz.uzlaunch.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import uz.uzlaunch.model.Project;
import uz.uzlaunch.model.User;
import java.util.List;
import java.util.Optional;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    Optional<Project> findBySlug(String slug);
    List<Project> findByUser(User user);
    boolean existsBySlug(String slug);

    List<Project> findTop5ByOrderBySubscriberCountDesc();

    @Modifying
    @Query("UPDATE Project p SET p.subscriberCount = p.subscriberCount + 1 WHERE p.id = :id")
    void incrementSubscriberCount(@Param("id") Long id);

    @Modifying
    @Query("UPDATE Project p SET p.subscriberCount = CASE WHEN p.subscriberCount > 0 THEN p.subscriberCount - 1 ELSE 0 END WHERE p.id = :id")
    void decrementSubscriberCount(@Param("id") Long id);
}
