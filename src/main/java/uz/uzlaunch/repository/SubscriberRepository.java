package uz.uzlaunch.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import uz.uzlaunch.model.Project;
import uz.uzlaunch.model.Subscriber;

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
}
