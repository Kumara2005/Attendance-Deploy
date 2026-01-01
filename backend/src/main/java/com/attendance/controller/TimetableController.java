package com.attendance.controller;

import java.util.List;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import com.attendance.model.TimetableSession;
import com.attendance.repository.TimetableSessionRepository;
import com.attendance.dto.ApiResponse;

@RestController
@RequestMapping("/api/admin/timetable")
public class TimetableController {

    private final TimetableSessionRepository repo;

    public TimetableController(TimetableSessionRepository repo) {
        this.repo = repo;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TimetableSession>> create(@RequestBody TimetableSession session) {
        TimetableSession created = repo.save(session);
        return ResponseEntity.ok(ApiResponse.success("Timetable session created", created));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<TimetableSession>>> getAll() {
        List<TimetableSession> sessions = repo.findAll();
        return ResponseEntity.ok(ApiResponse.success(sessions));
    }
}