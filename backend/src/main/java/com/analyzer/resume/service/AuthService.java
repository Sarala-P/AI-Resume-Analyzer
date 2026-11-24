package com.analyzer.resume.service;

import com.analyzer.resume.dto.AuthResponse;
import com.analyzer.resume.dto.LoginRequest;
import com.analyzer.resume.dto.SignupRequest;
import com.analyzer.resume.exception.BadRequestException;
import com.analyzer.resume.model.User;
import com.analyzer.resume.repository.UserRepository;
import com.analyzer.resume.security.JwtTokenProvider;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    public AuthResponse register(SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email address already in use");
        }

        // Use the role from the request (USER or RECRUITER)
        String role = (request.getRole() != null && request.getRole().equals("RECRUITER"))
                ? "RECRUITER" : "USER";

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .build();

        userRepository.save(user);

        String token = tokenProvider.generateToken(user.getEmail());

        return AuthResponse.builder()
                .token(token)
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadRequestException("Invalid email or password");
        }

        String token = tokenProvider.generateToken(user.getEmail());

        return AuthResponse.builder()
                .token(token)
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())   // include role in login response
                .build();
    }
}
