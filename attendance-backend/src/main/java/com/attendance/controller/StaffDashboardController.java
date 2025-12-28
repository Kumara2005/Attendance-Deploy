package com.attendance.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.attendance.dto.ApiResponse;
import com.attendance.dto.StaffDashboardDTO;
import com.attendance.service.StaffDashboardService;

/**
 * Staff/Teacher Dashboard Controller
 * Provides access to assigned classes formatted as: [Year] [Department] [Class]
 * Maps to: Staff Dashboard frontend components
 * 
 * RBAC: STAFF role only
 */
@RestController
@RequestMapping("/api/staff/dashboard")
@PreAuthorize("hasRole('STAFF')")
public class StaffDashboardController {

    private final StaffDashboardService dashboardService;

    public StaffDashboardController(StaffDashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    /**
     * GET /api/staff/dashboard
     * Returns complete staff dashboard with assigned classes
     */
    @GetMapping
    public ResponseEntity<ApiResponse<StaffDashboardDTO>> getDashboard(Authentication authentication) {
        String userId = authentication.getName(); // Staff user ID from JWT
        StaffDashboardDTO dashboard = dashboardService.getStaffDashboard(userId);
        return ResponseEntity.ok(ApiResponse.success(dashboard));
    }

    /**
     * GET /api/staff/dashboard/classes
     * Returns all assigned classes in format: [Year] [Department] [Class]
     */
    @GetMapping("/classes")
    public ResponseEntity<ApiResponse<StaffDashboardDTO.AssignedClassDTO[]>> getAssignedClasses(
            Authentication authentication) {
        String userId = authentication.getName();
        var classes = dashboardService.getAssignedClasses(userId);
        return ResponseEntity.ok(ApiResponse.success(classes));
    }

    /**
     * GET /api/staff/dashboard/sessions/today
     * Returns today's teaching sessions
     */
    @GetMapping("/sessions/today")
    public ResponseEntity<ApiResponse<StaffDashboardDTO.TodaySessionDTO[]>> getTodaySessions(
            Authentication authentication) {
        String userId = authentication.getName();
        var sessions = dashboardService.getTodaySessions(userId);
        return ResponseEntity.ok(ApiResponse.success(sessions));
    }
}
