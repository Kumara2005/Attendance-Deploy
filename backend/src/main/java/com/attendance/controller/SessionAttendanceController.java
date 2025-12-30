package com.attendance.controller;

import org.springframework.web.bind.annotation.*;
import com.attendance.model.SessionAttendance;
import com.attendance.service.SessionAttendanceService;

@RestController
@RequestMapping("/api/attendance/session")
public class SessionAttendanceController {

    private final SessionAttendanceService service;

    public SessionAttendanceController(SessionAttendanceService service) {
        this.service = service;
    }

    @PostMapping
    public SessionAttendance mark(@RequestBody SessionAttendance attendance) {
        return service.mark(attendance);
    }
}

