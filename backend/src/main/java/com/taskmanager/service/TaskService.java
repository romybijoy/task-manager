package com.taskmanager.service;

import com.taskmanager.dto.TaskDTO.*;
import com.taskmanager.entity.Task;
import com.taskmanager.entity.Task.TaskStatus;
import com.taskmanager.entity.Task.Priority;
import com.taskmanager.entity.User;
import com.taskmanager.exception.ResourceNotFoundException;
import com.taskmanager.repository.TaskRepository;
import com.taskmanager.repository.UserRepository;
import com.taskmanager.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TaskService {

    @Autowired private TaskRepository taskRepository;
    @Autowired private UserRepository userRepository;

    private Long getCurrentUserId() {
        UserDetailsImpl userDetails = (UserDetailsImpl)
                SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userDetails.getId();
    }
    public List<Response> getAllTasks(String status, String priority, String search) {
        Long userId = getCurrentUserId();

        // Parse enum values — null means "no filter" for that field
        TaskStatus statusEnum = null;
        if (status != null && !status.isBlank()) {
            try { statusEnum = TaskStatus.valueOf(status.toUpperCase()); }
            catch (IllegalArgumentException ignored) { /* unknown value → no filter */ }
        }

        Priority priorityEnum = null;
        if (priority != null && !priority.isBlank()) {
            try { priorityEnum = Priority.valueOf(priority.toUpperCase()); }
            catch (IllegalArgumentException ignored) { /* unknown value → no filter */ }
        }

        // Build the LIKE pattern in Java — avoids CONCAT inside JPQL (dialect-safe)
        String searchPattern = null;
        if (search != null && !search.isBlank()) {
            searchPattern = "%" + search.trim().toLowerCase() + "%";
        }

        // All filters applied in one query — no more if/else chain
        return taskRepository
                .findFiltered(userId, statusEnum, priorityEnum, searchPattern)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public Response getTaskById(Long taskId, Long userId) {
        Task task = taskRepository.findByIdAndUserId(taskId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + taskId));
        return mapToResponse(task);
    }

    public Response createTask(CreateRequest request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Task task = Task.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .status(request.getStatus() != null ? request.getStatus() : TaskStatus.TODO)
                .priority(request.getPriority() != null ? request.getPriority() : Priority.MEDIUM)
                .dueDate(request.getDueDate())
                .user(user)
                .build();
        return mapToResponse(taskRepository.save(task));
    }

    public Response updateTask(Long taskId, UpdateRequest request, Long userId) {
        Task task = taskRepository.findByIdAndUserId(taskId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + taskId));
        if (request.getTitle() != null) task.setTitle(request.getTitle());
        if (request.getDescription() != null) task.setDescription(request.getDescription());
        if (request.getStatus() != null) task.setStatus(request.getStatus());
        if (request.getPriority() != null) task.setPriority(request.getPriority());
        if (request.getDueDate() != null) task.setDueDate(request.getDueDate());
        return mapToResponse(taskRepository.save(task));
    }

    public void deleteTask(Long taskId, Long userId) {
        Task task = taskRepository.findByIdAndUserId(taskId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + taskId));
        taskRepository.delete(task);
    }

    public StatsResponse getStats(Long userId) {
        long total = taskRepository.findByUserIdOrderByCreatedAtDesc(userId).size();
        long todo = taskRepository.countByUserIdAndStatus(userId, TaskStatus.TODO);
        long inProgress = taskRepository.countByUserIdAndStatus(userId, TaskStatus.IN_PROGRESS);
        long completed = taskRepository.countByUserIdAndStatus(userId, TaskStatus.COMPLETED);
        StatsResponse stats = new StatsResponse();
        stats.setTotal(total);
        stats.setTodo(todo);
        stats.setInProgress(inProgress);
        stats.setCompleted(completed);
        return stats;
    }

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
