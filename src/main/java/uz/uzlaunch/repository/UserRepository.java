package uz.uzlaunch.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import uz.uzlaunch.model.User;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    long countByCreatedAtAfter(LocalDateTime dateTime);

    @Query(value = """
        SELECT TO_CHAR(created_at, 'YYYY-MM-DD') AS day, COUNT(*) AS cnt
        FROM users
        WHERE created_at >= :since
        GROUP BY TO_CHAR(created_at, 'YYYY-MM-DD')
        ORDER BY TO_CHAR(created_at, 'YYYY-MM-DD')
        """, nativeQuery = true)
    List<Object[]> countDailySignupsSince(@Param("since") LocalDateTime since);
}
