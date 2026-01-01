package com.attendance.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import com.attendance.model.SystemSettings;
import com.attendance.repository.SystemSettingsRepository;
import com.attendance.dto.ApiResponse;

@RestController
@RequestMapping("/api/admin/settings")
public class SettingsController {

    private final SystemSettingsRepository repo;

    public SettingsController(SystemSettingsRepository repo) {
        this.repo = repo;
    }

    // 🔹 Save / Update settings (Admin)
    @PostMapping
    public ResponseEntity<ApiResponse<SystemSettings>> save(@RequestBody SystemSettings settings) {
        settings.setId(1L); // ensure single row
        SystemSettings saved = repo.save(settings);
        return ResponseEntity.ok(ApiResponse.success("Settings saved successfully", saved));
    }

    // 🔹 Get current settings
    @GetMapping
    public ResponseEntity<ApiResponse<SystemSettings>> get() {
        SystemSettings settings = repo.findById(1L)
                .orElseThrow(() -> new RuntimeException("Settings not configured"));
        return ResponseEntity.ok(ApiResponse.success(settings));
    }
}
