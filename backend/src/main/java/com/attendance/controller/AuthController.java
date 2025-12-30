package com.attendance.controller;

import java.time.Instant;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.attendance.dto.ApiResponse;
import com.attendance.dto.LoginRequest;
import com.attendance.dto.LoginResponse;
import com.attendance.model.RefreshToken;
import com.attendance.model.User;
import com.attendance.repository.RefreshTokenRepository;
import com.attendance.repository.UserRepository;
import com.attendance.security.JwtUtil;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authManager;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;

    public AuthController(AuthenticationManager authManager,
                          JwtUtil jwtUtil,
                          UserRepository userRepository,
                          RefreshTokenRepository refreshTokenRepository) {
        this.authManager = authManager;
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        try {
            authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUsername(), 
                            request.getPassword()));

            User user = userRepository.findByUsername(request.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            String token = jwtUtil.generateToken(request.getUsername());
            String refreshToken = jwtUtil.generateRefreshToken(request.getUsername());

            // Store refresh token in database
            RefreshToken refreshTokenEntity = new RefreshToken(
                user.getId(),
                refreshToken,
                Instant.now().plusMillis(86400000) // 24 hours
            );
            refreshTokenRepository.save(refreshTokenEntity);

            LoginResponse response = new LoginResponse(
                    token, 
                    refreshToken, 
                    user.getUsername(), 
                    user.getRole(),
                    user.getId(),
                    user.getUsername(),
                    user.getUsername() + "@attendx.edu"
            );

            return ResponseEntity.ok(ApiResponse.success("Login successful", response));
        } catch (AuthenticationException e) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.error("Invalid username or password"));
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<LoginResponse>> refreshToken(@RequestParam String refreshToken) {
        try {
            // Verify refresh token exists in database
            RefreshToken storedToken = refreshTokenRepository.findByToken(refreshToken)
                    .orElseThrow(() -> new RuntimeException("Invalid refresh token"));
            
            if (storedToken.isExpired()) {
                refreshTokenRepository.delete(storedToken);
                return ResponseEntity.status(401)
                        .body(ApiResponse.error("Refresh token expired"));
            }

            String username = jwtUtil.extractUsername(refreshToken);
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            String newToken = jwtUtil.generateToken(username);
            String newRefreshToken = jwtUtil.generateRefreshToken(username);

            // Replace old refresh token
            refreshTokenRepository.delete(storedToken);
            RefreshToken newRefreshTokenEntity = new RefreshToken(
                user.getId(),
                newRefreshToken,
                Instant.now().plusMillis(86400000)
            );
            refreshTokenRepository.save(newRefreshTokenEntity);

            LoginResponse response = new LoginResponse(
                    newToken,
                    newRefreshToken,
                    user.getUsername(),
                    user.getRole(),
                    user.getId(),
                    user.getUsername(),
                    user.getUsername() + "@attendx.edu"
            );

            return ResponseEntity.ok(ApiResponse.success("Token refreshed", response));
        } catch (Exception e) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.error("Invalid refresh token"));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(@RequestHeader("Authorization") String authHeader) {
        try {
            // Extract token from "Bearer <token>"
            String token = authHeader.substring(7);
            String username = jwtUtil.extractUsername(token);
            
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Revoke all refresh tokens for this user
            refreshTokenRepository.deleteByUserId(user.getId());
            
            return ResponseEntity.ok(ApiResponse.success("Logged out successfully", null));
        } catch (Exception e) {
            return ResponseEntity.status(400)
                    .body(ApiResponse.error("Logout failed"));
        }
    }
}
