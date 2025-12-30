package com.attendance.controller;

import java.util.List;
import org.springframework.web.bind.annotation.*;
import com.attendance.model.TimetableSession;
import com.attendance.repository.TimetableSessionRepository;

@RestController
@RequestMapping("/api/admin/timetable")
public class TimetableController {

    private final TimetableSessionRepository repo;

    public TimetableController(TimetableSessionRepository repo) {
        this.repo = repo;
    }

    @PostMapping
    public TimetableSession create(@RequestBody TimetableSession session) {
        return repo.save(session);
    }

    @GetMapping
    public List<TimetableSession> getAll() {
        return repo.findAll();
    }
}