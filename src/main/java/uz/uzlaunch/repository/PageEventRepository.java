package uz.uzlaunch.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import uz.uzlaunch.model.PageEvent;
import uz.uzlaunch.model.Project;

import java.time.LocalDateTime;
import java.util.List;

public interface PageEventRepository extends JpaRepository<PageEvent, Long> {

    @Query("SELECT COUNT(e) FROM PageEvent e WHERE e.project = :project AND e.eventType = :type")
    long countByProjectAndType(@Param("project") Project project, @Param("type") String type);

    @Query("SELECT COUNT(e) FROM PageEvent e WHERE e.project = :project AND e.eventType = :type AND e.createdAt >= :since")
    long countByProjectAndTypeSince(@Param("project") Project project, @Param("type") String type, @Param("since") LocalDateTime since);

    @Query("SELECT FUNCTION('DATE', e.createdAt), e.eventType, COUNT(e) FROM PageEvent e " +
           "WHERE e.project = :project AND e.createdAt >= :since GROUP BY FUNCTION('DATE', e.createdAt), e.eventType")
    List<Object[]> dailyCountsSince(@Param("project") Project project, @Param("since") LocalDateTime since);
}
