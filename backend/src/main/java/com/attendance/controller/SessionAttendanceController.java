package com.attendance.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import com.attendance.model.SessionAttendance;
import com.attendance.service.SessionAttendanceService;
import com.attendance.dto.ApiResponse;
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/attendance/session")
public class SessionAttendanceController {

    private final SessionAttendanceService service;

    public SessionAttendanceController(SessionAttendanceService service) {
        this.service = service;
    }

    @PostMapping
    @PreAuthorize("hasRole('STAFF')")
    public ResponseEntity<ApiResponse<SessionAttendance>> mark(@RequestBody SessionAttendance attendance) {
        SessionAttendance marked = service.mark(attendance);
        return ResponseEntity.ok(ApiResponse.success(marked));
    }
}

