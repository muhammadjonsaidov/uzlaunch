package uz.uzlaunch.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import uz.uzlaunch.model.Project;
import uz.uzlaunch.model.User;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    Optional<Project> findBySlug(String slug);
    List<Project> findByUser(User user);
    boolean existsBySlug(String slug);

    List<Project> findTop5ByOrderBySubscriberCountDesc();
    long countByUser(User user);

    List<Project> findByLaunchAtBeforeAndLaunchNotifiedFalse(LocalDateTime now);

    @Modifying
    @Query("UPDATE Project p SET p.subscriberCount = p.subscriberCount + 1 WHERE p.id = :id")
    void incrementSubscriberCount(@Param("id") Long id);

    @Modifying
    @Query("UPDATE Project p SET p.subscriberCount = CASE WHEN p.subscriberCount > 0 THEN p.subscriberCount - 1 ELSE 0 END WHERE p.id = :id")
    void decrementSubscriberCount(@Param("id") Long id);

    @Query("SELECT p FROM Project p WHERE p.isPublic = true AND p.subscriberCount > 0 ORDER BY p.createdAt DESC")
    Page<Project> findPublicNewest(Pageable pageable);

    @Query("SELECT p FROM Project p WHERE p.isPublic = true AND p.subscriberCount > 0 ORDER BY p.validationScore DESC, p.subscriberCount DESC")
    Page<Project> findPublicTopScore(Pageable pageable);

    @Query("SELECT p, " +
           "(SELECT COUNT(s) FROM Subscriber s WHERE s.project = p AND s.confirmed = true AND s.confirmedAt >= :since) AS recent " +
           "FROM Project p WHERE p.isPublic = true AND p.subscriberCount > 0 " +
           "ORDER BY recent DESC, p.subscriberCount DESC")
    Page<Object[]> findPublicTrending(@Param("since") LocalDateTime since, Pageable pageable);
}
