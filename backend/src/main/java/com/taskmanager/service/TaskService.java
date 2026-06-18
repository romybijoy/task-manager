package com.taskmanager.service;

import com.taskmanager.dto.TaskDTO.*;
import com.taskmanager.entity.Task;
import com.taskmanager.entity.Task.Priority;
import com.taskmanager.entity.Task.TaskStatus;
import com.taskmanager.entity.User;
import com.taskmanager.exception.ResourceNotFoundException;
import com.taskmanager.repository.TaskRepository;
import com.taskmanager.repository.UserRepository;
import com.taskmanager.security.UserDetailsImpl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TaskService {

    private static final Logger log = LoggerFactory.getLogger(TaskService.class);

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Get current logged-in user ID from Security Context.
     */
    private Long getCurrentUserId() {
        UserDetailsImpl userDetails = (UserDetailsImpl)
                SecurityContextHolder.getContext()
                        .getAuthentication()
                        .getPrincipal();

        return userDetails.getId();
    }

    /**
     * Get all tasks with optional filters.
     */
    public List<Response> getAllTasks(String status,
                                      String priority,
                                      String search) {

        Long userId = getCurrentUserId();

        log.info("Fetching tasks for userId={}", userId);
        log.debug("Filters received: status={}, priority={}, search={}",
                status, priority, search);

        TaskStatus statusEnum = null;
        if (status != null && !status.isBlank()) {
            try {
                statusEnum = TaskStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException ignored) {
                log.warn("Invalid status filter received: {}", status);
            }
        }

        Priority priorityEnum = null;
        if (priority != null && !priority.isBlank()) {
            try {
                priorityEnum = Priority.valueOf(priority.toUpperCase());
            } catch (IllegalArgumentException ignored) {
                log.warn("Invalid priority filter received: {}", priority);
            }
        }

        String searchPattern = null;
        if (search != null && !search.isBlank()) {
            searchPattern = "%" + search.trim().toLowerCase() + "%";
        }

        List<Response> tasks = taskRepository
                .findFiltered(
                        userId,
                        statusEnum,
                        priorityEnum,
                        searchPattern)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        log.info("Found {} task(s) for userId={}",
                tasks.size(),
                userId);

        return tasks;
    }

    /**
     * Get task by ID.
     */
    public Response getTaskById(Long taskId, Long userId) {

        log.info("Fetching task id={} for userId={}",
                taskId,
                userId);

        Task task = taskRepository
                .findByIdAndUserId(taskId, userId)
                .orElseThrow(() -> {
                    log.warn("Task not found. taskId={}, userId={}",
                            taskId,
                            userId);

                    return new ResourceNotFoundException(
                            "Task not found with id: " + taskId);
                });

        log.info("Task retrieved successfully. taskId={}",
                taskId);

        return mapToResponse(task);
    }

    /**
     * Create new task.
     */
    public Response createTask(CreateRequest request,
                               Long userId) {

        log.info("Creating task for userId={}", userId);

        User user = userRepository
                .findById(userId)
                .orElseThrow(() -> {
                    log.warn("User not found. userId={}", userId);

                    return new ResourceNotFoundException(
                            "User not found");
                });

        Task task = Task.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .status(
                        request.getStatus() != null
                                ? request.getStatus()
                                : TaskStatus.TODO
                )
                .priority(
                        request.getPriority() != null
                                ? request.getPriority()
                                : Priority.MEDIUM
                )
                .dueDate(request.getDueDate())
                .user(user)
                .build();

        Task savedTask = taskRepository.save(task);

        log.info("Task created successfully. taskId={}, userId={}",
                savedTask.getId(),
                userId);

        return mapToResponse(savedTask);
    }

    /**
     * Update existing task.
     */
    public Response updateTask(Long taskId,
                               UpdateRequest request,
                               Long userId) {

        log.info("Updating task id={} for userId={}",
                taskId,
                userId);

        Task task = taskRepository
                .findByIdAndUserId(taskId, userId)
                .orElseThrow(() -> {
                    log.warn("Task not found for update. taskId={}, userId={}",
                            taskId,
                            userId);

                    return new ResourceNotFoundException(
                            "Task not found with id: " + taskId);
                });

        if (request.getTitle() != null) {
            task.setTitle(request.getTitle());
        }

        if (request.getDescription() != null) {
            task.setDescription(request.getDescription());
        }

        if (request.getStatus() != null) {
            task.setStatus(request.getStatus());
        }

        if (request.getPriority() != null) {
            task.setPriority(request.getPriority());
        }

        if (request.getDueDate() != null) {
            task.setDueDate(request.getDueDate());
        }

        Task updatedTask = taskRepository.save(task);

        log.info("Task updated successfully. taskId={}",
                updatedTask.getId());

        return mapToResponse(updatedTask);
    }

    /**
     * Delete task.
     */
    public void deleteTask(Long taskId,
                           Long userId) {

        log.info("Deleting task id={} for userId={}",
                taskId,
                userId);

        Task task = taskRepository
                .findByIdAndUserId(taskId, userId)
                .orElseThrow(() -> {
                    log.warn("Task not found for deletion. taskId={}, userId={}",
                            taskId,
                            userId);

                    return new ResourceNotFoundException(
                            "Task not found with id: " + taskId);
                });

        taskRepository.delete(task);

        log.info("Task deleted successfully. taskId={}",
                taskId);
    }

    /**
     * Get dashboard statistics.
     */
    public StatsResponse getStats(Long userId) {

        log.info("Generating task statistics for userId={}",
                userId);

        long total = taskRepository.findByUserIdOrderByCreatedAtDesc(userId).size();

        long todo = taskRepository.countByUserIdAndStatus(
                userId,
                TaskStatus.TODO
        );

        long inProgress = taskRepository.countByUserIdAndStatus(
                userId,
                TaskStatus.IN_PROGRESS
        );

        long completed = taskRepository.countByUserIdAndStatus(
                userId,
                TaskStatus.COMPLETED
        );

        StatsResponse stats = new StatsResponse();
        stats.setTotal(total);
        stats.setTodo(todo);
        stats.setInProgress(inProgress);
        stats.setCompleted(completed);

        log.info(
                "Statistics generated successfully. total={}, todo={}, inProgress={}, completed={}",
                total,
                todo,
                inProgress,
                completed
        );

        return stats;
    }

    /**
     * Convert Task entity to API response DTO.
     */
    private Response mapToResponse(Task task) {

        Response res = new Response();

        res.setId(task.getId());
        res.setTitle(task.getTitle());
        res.setDescription(task.getDescription());
        res.setStatus(task.getStatus());
        res.setPriority(task.getPriority());
        res.setDueDate(task.getDueDate());
        res.setCreatedAt(task.getCreatedAt());
        res.setUpdatedAt(task.getUpdatedAt());

        res.setUserId(task.getUser().getId());
        res.setUsername(task.getUser().getUsername());

        return res;
    }
}