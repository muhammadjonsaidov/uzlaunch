package uz.uzlaunch.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import uz.uzlaunch.model.User;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    long countByCreatedAtAfter(LocalDateTime dateTime);
    List<User> findByCreatedAtAfter(LocalDateTime dateTime);
    java.util.Optional<User> findByVerificationToken(String token);
    Optional<User> findByResetToken(String token);
}
