package com.attendance.controller;

import org.springframework.web.bind.annotation.*;

import com.attendance.model.SystemSettings;
import com.attendance.repository.SystemSettingsRepository;

@RestController
@RequestMapping("/api/admin/settings")
public class SettingsController {

    private final SystemSettingsRepository repo;

    public SettingsController(SystemSettingsRepository repo) {
        this.repo = repo;
    }

    // 🔹 Save / Update settings (Admin)
    @PostMapping
    public SystemSettings save(@RequestBody SystemSettings settings) {
        settings.setId(1L); // ensure single row
        return repo.save(settings);
    }

    // 🔹 Get current settings
    @GetMapping
    public SystemSettings get() {
        return repo.findById(1L)
                .orElseThrow(() -> new RuntimeException("Settings not configured"));
    }
}
