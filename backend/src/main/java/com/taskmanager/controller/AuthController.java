package com.taskmanager.controller;

import com.taskmanager.dto.AuthDTO.*;
import com.taskmanager.service.AuthService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private AuthService authService;

    /**
     * Authenticate user and generate JWT token.

     * Example:
     * POST /api/auth/login
     */
    @PostMapping("/login")
    public ResponseEntity<JwtResponse> login(
            @Valid @RequestBody LoginRequest request) {

        log.info("Login request received for email={}", request.getUsername());

        JwtResponse response = authService.login(request);

        log.info("User logged in successfully: {}", request.getUsername());

        return ResponseEntity.ok(response);
    }

    /**
     * Register a new user.

     * Example:
     * POST /api/auth/register
     */
    @PostMapping("/register")
    public ResponseEntity<MessageResponse> register(
            @Valid @RequestBody RegisterRequest request) {

        log.info("Registration request received for email={}", request.getEmail());

        MessageResponse response = authService.register(request);

        log.info("User registered successfully: {}", request.getEmail());

        return ResponseEntity.ok(response);
    }
}