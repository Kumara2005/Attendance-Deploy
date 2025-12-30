package com.attendance.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.attendance.dto.AdminDashboardDTO;
import com.attendance.dto.ApiResponse;
import com.attendance.model.TimetableSession;
import com.attendance.service.AdminDashboardService;
import com.attendance.service.TimetableManagementService;

import jakarta.validation.Valid;

import java.util.List;

/**
 * Admin Dashboard Controller
 * Provides CREATE/READ/UPDATE/DELETE access to master timetable and curriculum registry
 * Maps to: Admin Dashboard frontend components
 * 
 * RBAC: ADMIN role only
 */
@RestController
@RequestMapping("/api/admin/dashboard")
@PreAuthorize("hasRole('ADMIN')")
public class AdminDashboardController {

    private final AdminDashboardService dashboardService;
    private final TimetableManagementService timetableService;

    public AdminDashboardController(AdminDashboardService dashboardService, 
                                   TimetableManagementService timetableService) {
        this.dashboardService = dashboardService;
        this.timetableService = timetableService;
    }

    /**
     * GET /api/admin/dashboard
     * Returns complete admin dashboard with Programme Registry
     */
    @GetMapping
    public ResponseEntity<ApiResponse<AdminDashboardDTO>> getDashboard() {
        AdminDashboardDTO dashboard = dashboardService.getAdminDashboard();
        return ResponseEntity.ok(ApiResponse.success(dashboard));
    }

    /**
     * GET /api/admin/dashboard/programmes
     * Returns all programmes for Curriculum Registry cards
     */
    @GetMapping("/programmes")
    public ResponseEntity<ApiResponse<List<AdminDashboardDTO.ProgrammeDTO>>> getProgrammes() {
        List<AdminDashboardDTO.ProgrammeDTO> programmes = dashboardService.getAllProgrammes();
        return ResponseEntity.ok(ApiResponse.success(programmes));
    }

    // ========== MASTER TIMETABLE MANAGEMENT ==========

    /**
     * GET /api/admin/dashboard/timetable
     * Returns complete master timetable (all days, all classes)
     */
    @GetMapping("/timetable")
    public ResponseEntity<ApiResponse<List<TimetableSession>>> getMasterTimetable() {
        List<TimetableSession> timetable = timetableService.getAllSessions();
        return ResponseEntity.ok(ApiResponse.success(timetable));
    }

    /**
     * POST /api/admin/dashboard/timetable
     * Creates a new timetable session
     */
    @PostMapping("/timetable")
    public ResponseEntity<ApiResponse<TimetableSession>> createTimetableSession(
            @Valid @RequestBody TimetableSession session) {
        TimetableSession created = timetableService.createSession(session);
        return ResponseEntity.ok(ApiResponse.success("Timetable session created successfully", created));
    }

    /**
     * PUT /api/admin/dashboard/timetable/{id}
     * Updates an existing timetable session
     */
    @PutMapping("/timetable/{id}")
    public ResponseEntity<ApiResponse<TimetableSession>> updateTimetableSession(
            @PathVariable Long id,
            @Valid @RequestBody TimetableSession session) {
        TimetableSession updated = timetableService.updateSession(id, session);
        return ResponseEntity.ok(ApiResponse.success("Timetable session updated successfully", updated));
    }

    /**
     * DELETE /api/admin/dashboard/timetable/{id}
     * Deletes a timetable session
     */
    @DeleteMapping("/timetable/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTimetableSession(@PathVariable Long id) {
        timetableService.deleteSession(id);
        return ResponseEntity.ok(ApiResponse.success("Timetable session deleted successfully", null));
    }

    /**
     * GET /api/admin/dashboard/timetable/department/{department}/semester/{semester}
     * Gets timetable for specific department and semester
     */
    @GetMapping("/timetable/department/{department}/semester/{semester}")
    public ResponseEntity<ApiResponse<List<TimetableSession>>> getTimetableByDepartmentAndSemester(
            @PathVariable String department,
            @PathVariable int semester) {
        List<TimetableSession> timetable = timetableService.getSessionsByDepartmentAndSemester(department, semester);
        return ResponseEntity.ok(ApiResponse.success(timetable));
    }
}
