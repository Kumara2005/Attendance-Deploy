package com.attendance.security;

import java.security.Key;
import java.util.Date;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;

@Component
public class JwtUtil {

    private static final Logger logger = LoggerFactory.getLogger(JwtUtil.class);
    private static final int MINIMUM_SECRET_LENGTH = 64;

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private long expirationTime;

    @Value("${jwt.refresh-expiration}")
    private long refreshExpirationTime;

    /**
     * Validates JWT secret on application startup
     * Application will FAIL TO START if secret is invalid or missing
     */
    @PostConstruct
    public void validateSecretConfiguration() {
        if (secret == null || secret.trim().isEmpty()) {
            logger.error("CRITICAL SECURITY ERROR: JWT_SECRET environment variable is not set!");
            throw new IllegalStateException(
                "JWT_SECRET environment variable must be set. " +
                "Generate with: openssl rand -base64 64"
            );
        }
        
        if (secret.length() < MINIMUM_SECRET_LENGTH) {
            logger.error("CRITICAL SECURITY ERROR: JWT_SECRET is too short (minimum {} characters required)", 
                MINIMUM_SECRET_LENGTH);
            throw new IllegalStateException(
                String.format("JWT_SECRET must be at least %d characters. Current length: %d", 
                    MINIMUM_SECRET_LENGTH, secret.length())
            );
        }
        
        // Check for common insecure patterns
        if (secret.toLowerCase().contains("change") || 
            secret.toLowerCase().contains("default") ||
            secret.toLowerCase().contains("secret")) {
            logger.error("CRITICAL SECURITY ERROR: JWT_SECRET contains insecure default values!");
            throw new IllegalStateException(
                "JWT_SECRET appears to contain default/placeholder text. " +
                "Use a cryptographically secure random value."
            );
        }
        
        logger.info("JWT secret validation passed. Secret length: {} characters", secret.length());
    }

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    public String generateToken(String username) {
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expirationTime))
                .signWith(getSigningKey())
                .compact();
    }

    public String generateRefreshToken(String username) {
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + refreshExpirationTime))
                .signWith(getSigningKey())
                .compact();
    }

    public String extractUsername(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();

        return claims.getSubject();
    }

    public boolean isTokenExpired(String token) {
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
            
            return claims.getExpiration().before(new Date());
        } catch (Exception e) {
            return true;
        }
    }

    public boolean validateToken(String token, String username) {
        final String extractedUsername = extractUsername(token);
        return (extractedUsername.equals(username) && !isTokenExpired(token));
    }
}
