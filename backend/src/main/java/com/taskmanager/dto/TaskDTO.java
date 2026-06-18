package com.taskmanager.dto;

import com.taskmanager.entity.Task.Priority;
import com.taskmanager.entity.Task.TaskStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class TaskDTO {

    @Data
    public static class CreateRequest {
        @NotBlank
        private String title;
        private String description;
        private TaskStatus status;
        private Priority priority;
        private LocalDate dueDate;
    }

    @Data
    public static class UpdateRequest {
        private String title;
        private String description;
        private TaskStatus status;
        private Priority priority;
        private LocalDate dueDate;
    }

    @Data
    public static class Response {
        private Long id;
        private String title;
        private String description;
        private TaskStatus status;
        private Priority priority;
        private LocalDate dueDate;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private Long userId;
        private String username;
    }

    @Data
    public static class StatsResponse {
        private long total;
        private long todo;
        private long inProgress;
        private long completed;
    }
}
