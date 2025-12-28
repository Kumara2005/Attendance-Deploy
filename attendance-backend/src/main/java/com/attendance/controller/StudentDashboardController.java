package com.attendance.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.attendance.dto.ApiResponse;
import com.attendance.dto.StudentDashboardDTO;
import com.attendance.service.StudentDashboardService;

/**
 * Student Dashboard Controller
 * Provides READ-ONLY access to student's attendance and timetable
 * Maps to: StudentPortal.tsx frontend component
 * 
 * RBAC: STUDENT role only
 */
@RestController
@RequestMapping("/api/student/dashboard")
@PreAuthorize("hasRole('STUDENT')")
public class StudentDashboardController {

    private final StudentDashboardService dashboardService;

    public StudentDashboardController(StudentDashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    /**
     * GET /api/student/dashboard
     * Returns complete dashboard data for the authenticated student
     * Includes: identity, attendance percentages, weekly timetable
     */
    @GetMapping
    public ResponseEntity<ApiResponse<StudentDashboardDTO>> getDashboard(Authentication authentication) {
        String userId = authentication.getName(); // User ID from JWT token
        StudentDashboardDTO dashboard = dashboardService.getStudentDashboard(userId);
        return ResponseEntity.ok(ApiResponse.success(dashboard));
    }

    /**
     * GET /api/student/dashboard/attendance
     * Returns ONLY attendance data (all subjects)
     */
    @GetMapping("/attendance")
    public ResponseEntity<ApiResponse<StudentDashboardDTO.SubjectAttendanceDTO[]>> getAttendance(
            Authentication authentication) {
        String userId = authentication.getName();
        var attendance = dashboardService.getStudentAttendance(userId);
        return ResponseEntity.ok(ApiResponse.success(attendance));
    }

    /**
     * GET /api/student/dashboard/timetable
     * Returns weekly timetable for the student's class
     */
    @GetMapping("/timetable")
    public ResponseEntity<ApiResponse<com.attendance.dto.WeeklyTimetableDTO>> getTimetable(
            Authentication authentication) {
        String userId = authentication.getName();
        var timetable = dashboardService.getStudentTimetable(userId);
        return ResponseEntity.ok(ApiResponse.success(timetable));
    }

    /**
     * GET /api/student/dashboard/timetable/today
     * Returns TODAY's timetable only
     */
    @GetMapping("/timetable/today")
    public ResponseEntity<ApiResponse<com.attendance.dto.WeeklyTimetableDTO.TimetableSlotDTO[]>> getTodayTimetable(
            Authentication authentication) {
        String userId = authentication.getName();
        var todaySchedule = dashboardService.getTodayTimetable(userId);
        return ResponseEntity.ok(ApiResponse.success(todaySchedule));
    }
}
