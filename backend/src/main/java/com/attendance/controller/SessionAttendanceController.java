package com.attendance.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import com.attendance.model.SessionAttendance;
import com.attendance.service.SessionAttendanceService;
import com.attendance.dto.ApiResponse;
import com.attendance.dto.AttendanceSubmissionDTO;
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
    public ResponseEntity<ApiResponse<SessionAttendance>> markAttendance(@RequestBody AttendanceSubmissionDTO dto) {
        try {
            System.out.println("📝 Received attendance submission: " + dto);
            SessionAttendance saved = service.markAttendance(dto);
            System.out.println("✅ Attendance marked successfully with ID: " + saved.getId());
            return ResponseEntity.ok(ApiResponse.success(saved));
        } catch (Exception e) {
            System.err.println("❌ Error marking attendance: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(ApiResponse.error("Error: " + e.getMessage()));
        }
    }

    /**
     * Legacy endpoint for backward compatibility
     */
    @PostMapping("/legacy")
    @PreAuthorize("hasRole('STAFF')")
    public ResponseEntity<ApiResponse<SessionAttendance>> mark(@RequestBody SessionAttendance attendance) {
        try {
            System.out.println("📝 Received legacy attendance record: " + attendance);
            System.out.println("   Student: " + (attendance.getStudent() != null ? attendance.getStudent().getId() : "null"));
            System.out.println("   TimetableSession: " + (attendance.getTimetableSession() != null ? attendance.getTimetableSession().getId() : "null"));
            System.out.println("   Date: " + attendance.getDate());
            System.out.println("   Status: " + attendance.getStatus());
            
            SessionAttendance marked = service.mark(attendance);
            
            System.out.println("✅ Attendance saved with ID: " + marked.getId());
            return ResponseEntity.ok(ApiResponse.success(marked));
        } catch (Exception e) {
            System.err.println("❌ Error marking attendance: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(ApiResponse.error("Error: " + e.getMessage()));
        }
    }
}

