package com.taskmanager.service;

import com.taskmanager.dto.AuthDTO.*;
import com.taskmanager.entity.User;
import com.taskmanager.exception.BadRequestException;
import com.taskmanager.repository.UserRepository;
import com.taskmanager.security.JwtUtils;
import com.taskmanager.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired private AuthenticationManager authenticationManager;
    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JwtUtils jwtUtils;

    public JwtResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return new JwtResponse(jwt, userDetails.getId(), userDetails.getUsername(),
                userDetails.getEmail(), userDetails.getFullName());
    }

    public MessageResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername()))
            throw new BadRequestException("Username is already taken");
        if (userRepository.existsByEmail(request.getEmail()))
            throw new BadRequestException("Email is already in use");

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .build();
        userRepository.save(user);
        return new MessageResponse("User registered successfully");
    }
}
