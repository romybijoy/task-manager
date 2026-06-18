package com.taskmanager.service;

import com.taskmanager.dto.AuthDTO.*;
import com.taskmanager.entity.User;
import com.taskmanager.exception.BadRequestException;
import com.taskmanager.repository.UserRepository;
import com.taskmanager.security.JwtUtils;
import com.taskmanager.security.UserDetailsImpl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    /**
     * Authenticate user and generate JWT token.
     */
    public JwtResponse login(LoginRequest request) {

        log.info("Authenticating user: {}", request.getUsername());

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword())
        );

        log.info("Authentication successful for user: {}", request.getUsername());

        SecurityContextHolder.getContext().setAuthentication(authentication);

        String jwt = jwtUtils.generateJwtToken(authentication);

        log.debug("JWT token generated successfully for user: {}", request.getUsername());

        UserDetailsImpl userDetails =
                (UserDetailsImpl) authentication.getPrincipal();

        log.info("Login completed successfully for userId={}",
                userDetails.getId());

        return new JwtResponse(
                jwt,
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getEmail(),
                userDetails.getFullName()
        );
    }

    /**
     * Register a new user.
     */
    public MessageResponse register(RegisterRequest request) {

        log.info("Registration request received for username={} email={}",
                request.getUsername(),
                request.getEmail());

        if (userRepository.existsByUsername(request.getUsername())) {

            log.warn("Registration failed. Username already exists: {}",
                    request.getUsername());

            throw new BadRequestException("Username is already taken");
        }

        if (userRepository.existsByEmail(request.getEmail())) {

            log.warn("Registration failed. Email already exists: {}",
                    request.getEmail());

            throw new BadRequestException("Email is already in use");
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .build();

        user = userRepository.save(user);

        log.info("User registered successfully with id={} username={}",
                user.getId(),
                user.getUsername());

        return new MessageResponse("User registered successfully");
    }
}