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
    @GetMapping
    public ResponseEntity<List<Response>> getAllTasks(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String search) {
        // Accept the search term under either name so a frontend/back-end
        // naming mismatch ("keyword" vs "search") can't silently disable search.
        String term = (keyword != null && !keyword.isBlank()) ? keyword : search;
        log.info("GET /api/tasks  status={} priority={} term={}", status, priority, term);
        // Service derives the current user from the SecurityContext itself
        return ResponseEntity.ok(taskService.getAllTasks(status, priority, term));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Response> getTaskById(@PathVariable Long id,
                                                @AuthenticationPrincipal UserDetailsImpl currentUser) {
        return ResponseEntity.ok(taskService.getTaskById(id, currentUser.getId()));
    }

    @PostMapping
    public ResponseEntity<Response> createTask(@Valid @RequestBody CreateRequest request,
                                               @AuthenticationPrincipal UserDetailsImpl currentUser) {
        return ResponseEntity.status(HttpStatus.CREATED).body(taskService.createTask(request, currentUser.getId()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Response> updateTask(@PathVariable Long id,
                                               @RequestBody UpdateRequest request,
                                               @AuthenticationPrincipal UserDetailsImpl currentUser) {
        return ResponseEntity.ok(taskService.updateTask(id, request, currentUser.getId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id,
                                           @AuthenticationPrincipal UserDetailsImpl currentUser) {
        taskService.deleteTask(id, currentUser.getId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/stats")
    public ResponseEntity<StatsResponse> getStats(@AuthenticationPrincipal UserDetailsImpl currentUser) {
        return ResponseEntity.ok(taskService.getStats(currentUser.getId()));
    }
}