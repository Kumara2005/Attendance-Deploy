package com.attendance.controller;

import com.attendance.model.User;
import com.attendance.repository.UserRepository;
import org.springframework.web.bind.annotation.*;

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
    public List<User> getAllUsers() {
        return repo.findAll();
    }

    // ✅ Enable / Disable user (Admin)
    @PutMapping("/{id}/status")
    public void updateStatus(
            @PathVariable Long id,
            @RequestParam boolean enabled) {

        User user = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setEnabled(enabled);
        repo.save(user);
    }
}
