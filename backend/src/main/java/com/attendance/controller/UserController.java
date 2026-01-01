package com.attendance.controller;

import com.attendance.model.User;
import com.attendance.repository.UserRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import com.attendance.dto.ApiResponse;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
public class UserController {

    private final UserRepository repo;

    public UserController(UserRepository repo) {
        this.repo = repo;
    }

    // ✅ View all users (Admin)
    @GetMapping
    public ResponseEntity<ApiResponse<List<User>>> getAllUsers() {
        List<User> users = repo.findAll();
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    // ✅ Enable / Disable user (Admin)
    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<User>> updateStatus(
            @PathVariable Long id,
            @RequestParam boolean enabled) {

        User user = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setEnabled(enabled);
        User updated = repo.save(user);
        return ResponseEntity.ok(ApiResponse.success("User status updated", updated));
    }
}
