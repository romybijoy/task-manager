package com.taskmanager.repository;

import com.taskmanager.entity.Task;
import com.taskmanager.entity.Task.TaskStatus;
import com.taskmanager.entity.Task.Priority;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<Task> findByIdAndUserId(Long id, Long userId);

    /**
     * Combinable filter: any parameter may be null, in which case it is ignored.
     * status + priority + search all apply together (AND); search matches either
     * the title or the description (OR).

     * NOTE: {@code search} must already be a lowercased LIKE pattern, e.g.
     * {@code "%report%"} — the caller builds it (keeps CONCAT out of JPQL).
     */
    @Query("SELECT t FROM Task t WHERE t.user.id = :userId " +
            "AND t.deleted = false " +
            "AND (:status IS NULL OR t.status = :status) " +
            "AND (:priority IS NULL OR t.priority = :priority) " +
            "AND (:search IS NULL OR " +
            "     LOWER(t.title) LIKE :search OR " +
            "     LOWER(t.description) LIKE :search) " +
            "ORDER BY t.createdAt DESC")
    List<Task> findFiltered(@Param("userId") Long userId,
                            @Param("status") TaskStatus status,
                            @Param("priority") Priority priority,
                            @Param("search") String search);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.user.id = :userId AND t.status = :status")
    long countByUserIdAndStatus(@Param("userId") Long userId, @Param("status") TaskStatus status);
}