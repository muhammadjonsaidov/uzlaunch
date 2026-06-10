package uz.uzlaunch.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import uz.uzlaunch.model.Project;
import uz.uzlaunch.model.Subscriber;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface SubscriberRepository extends JpaRepository<Subscriber, Long> {
    List<Subscriber> findByProject(Project project);
    List<Subscriber> findByProjectAndConfirmed(Project project, boolean confirmed);
    Page<Subscriber> findByProjectAndConfirmed(Project project, boolean confirmed, Pageable pageable);
    Optional<Subscriber> findByProjectAndEmail(Project project, String email);
    Optional<Subscriber> findByToken(String token);
    long countByProjectAndConfirmed(Project project, boolean confirmed);
    long countByConfirmed(boolean confirmed);
    void deleteByProject(Project project);

    @Query("SELECT s.project.id, COUNT(s) FROM Subscriber s WHERE s.confirmed = false GROUP BY s.project.id")
    List<Object[]> countPendingGroupByProject();

    @Query("SELECT s FROM Subscriber s JOIN FETCH s.project WHERE s.confirmed = false ORDER BY s.subscribedAt DESC")
    List<Subscriber> findPendingWithProject();

    @Query("SELECT s FROM Subscriber s WHERE s.project = :project AND s.confirmed = true AND (LOWER(s.email) LIKE LOWER(CONCAT('%', :q, '%')) OR (s.name IS NOT NULL AND LOWER(s.name) LIKE LOWER(CONCAT('%', :q, '%'))))")
    Page<Subscriber> searchConfirmedByProject(@org.springframework.data.repository.query.Param("project") Project project, @org.springframework.data.repository.query.Param("q") String q, Pageable pageable);

    Optional<Subscriber> findByIdAndProject(Long id, Project project);

    @Query("SELECT s.commitment, COUNT(s) FROM Subscriber s WHERE s.project = :project AND s.confirmed = true GROUP BY s.commitment")
    List<Object[]> countByCommitment(@org.springframework.data.repository.query.Param("project") Project project);

    @Query("SELECT COUNT(s) FROM Subscriber s WHERE s.project = :project AND s.confirmed = true AND s.confirmedAt >= :since")
    long countConfirmedSince(@org.springframework.data.repository.query.Param("project") Project project,
                             @org.springframework.data.repository.query.Param("since") LocalDateTime since);

    @Query("SELECT COUNT(s) FROM Subscriber s WHERE s.project = :project AND s.confirmed = true AND s.confirmedAt >= :from AND s.confirmedAt < :to")
    long countConfirmedBetween(@org.springframework.data.repository.query.Param("project") Project project,
                               @org.springframework.data.repository.query.Param("from") LocalDateTime from,
                               @org.springframework.data.repository.query.Param("to") LocalDateTime to);
}
