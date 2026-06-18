package com.taskmanager.controller;

import com.taskmanager.dto.TaskDTO.*;
import com.taskmanager.security.UserDetailsImpl;
import com.taskmanager.service.TaskService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "*", maxAge = 3600)
public class TaskController {

    private static final Logger log = LoggerFactory.getLogger(TaskController.class);

    @Autowired
    private TaskService taskService;

    /**
     * Get all tasks with optional filtering by status, priority, or search term.

     * Example:
     * GET /api/tasks?status=PENDING
     * GET /api/tasks?priority=HIGH
     * GET /api/tasks?search=meeting
     */
    @GetMapping
    public ResponseEntity<List<Response>> getAllTasks(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String search) {
        String term = (keyword != null && !keyword.isBlank()) ? keyword : search;
        log.info("Fetching tasks | status={} | priority={} | search={}",
                status, priority, term);

        List<Response> tasks = taskService.getAllTasks(status, priority, term);

        log.info("Successfully fetched {} task(s)", tasks.size());

        return ResponseEntity.ok(tasks);
    }

    /**
     * Get a specific task by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Response> getTaskById(@PathVariable Long id,
                                                @AuthenticationPrincipal UserDetailsImpl currentUser) {
        log.info("User {} requested task with id={}",
                currentUser.getId(), id);

        Response task = taskService.getTaskById(id, currentUser.getId());

        log.info("Task {} retrieved successfully", id);

        return ResponseEntity.ok(task);
    }

    /**
     * Create a new task.
     */
    @PostMapping
    public ResponseEntity<Response> createTask(@Valid @RequestBody CreateRequest request,
                                               @AuthenticationPrincipal UserDetailsImpl currentUser) {
        log.info("User {} creating new task with title='{}'",
                currentUser.getId(), request.getTitle());

        Response task = taskService.createTask(request, currentUser.getId());

        log.info("Task created successfully with id={}",
                task.getId());

        return ResponseEntity.status(HttpStatus.CREATED).body(task);
    }

    /**
     * Update an existing task.
     */
    @PutMapping("/{id}")
    public ResponseEntity<Response> updateTask(@PathVariable Long id,
                                               @RequestBody UpdateRequest request,
                                               @AuthenticationPrincipal UserDetailsImpl currentUser) {
        log.info("User {} updating task id={}",
                currentUser.getId(), id);

        Response task = taskService.updateTask(id, request, currentUser.getId());

        log.info("Task {} updated successfully", id);

        return ResponseEntity.ok(task);
    }

    /**
     * Delete a task.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {

        log.info("User {} deleting task id={}",
                currentUser.getId(), id);

        taskService.deleteTask(id, currentUser.getId());

        log.info("Task {} deleted successfully", id);

        return ResponseEntity.noContent().build();
    }

    /**
     * Get task statistics for dashboard.

     * Example Response:
     * {
     *   "total": 10,
     *   "completed": 5,
     *   "pending": 3,
     *   "inProgress": 2
     * }
     */
    @GetMapping("/stats")
    public ResponseEntity<StatsResponse> getStats(@AuthenticationPrincipal UserDetailsImpl currentUser) {
        log.info("Fetching task statistics for user={}",
                currentUser.getId());

        StatsResponse stats = taskService.getStats(currentUser.getId());

        log.info("Statistics generated successfully for user={}",
                currentUser.getId());

        return ResponseEntity.ok(stats);
    }
}