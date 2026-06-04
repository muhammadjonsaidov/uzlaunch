package uz.uzlaunch.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import uz.uzlaunch.model.User;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
}
