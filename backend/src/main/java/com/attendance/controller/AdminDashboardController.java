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
import org.springframework.jdbc.core.JdbcTemplate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Map;

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

    private static final Logger logger = LoggerFactory.getLogger(AdminDashboardController.class);

    private final AdminDashboardService dashboardService;
    private final TimetableManagementService timetableService;
    private final JdbcTemplate jdbcTemplate;

    public AdminDashboardController(AdminDashboardService dashboardService, 
                                   TimetableManagementService timetableService,
                                   JdbcTemplate jdbcTemplate) {
        this.dashboardService = dashboardService;
        this.timetableService = timetableService;
        this.jdbcTemplate = jdbcTemplate;
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

    /**
     * POST /api/admin/dashboard/maintenance/sync-staff-timetables
     * Admin maintenance endpoint: Manually sync staff to timetable sessions
     * Assigns all staff members to timetable sessions matching their subjects
     */
    @PostMapping("/maintenance/sync-staff-timetables")
    public ResponseEntity<ApiResponse<String>> syncStaffToTimetables() {
        logger.info("🔄 Admin triggered manual staff-to-timetable sync...");
        
        try {
            String query = """
                SELECT DISTINCT ss.staff_id, s.name, sub.id as subject_id, sub.name as subject_name
                FROM staff_subjects ss
                JOIN staff s ON ss.staff_id = s.id
                JOIN subject sub ON ss.subject_id = sub.id
                WHERE s.active = true
                """;
            
            final int[] totalAssignments = {0};
            final StringBuilder result = new StringBuilder();
            
            jdbcTemplate.query(query, (rs) -> {
                Long staffId = rs.getLong("staff_id");
                String staffName = rs.getString("name");
                Long subjectId = rs.getLong("subject_id");
                String subjectName = rs.getString("subject_name");
                
                try {
                    // Assign staff to timetable sessions for their subject
                    int updated = jdbcTemplate.update(
                        "UPDATE timetable_session SET staff_id = ? WHERE subject_id = ? AND staff_id IS NULL AND active = true",
                        staffId, subjectId
                    );
                    
                    if (updated > 0) {
                        String msg = String.format("Assigned %s to %d session(s) for %s", staffName, updated, subjectName);
                        logger.info("  ✅ {}", msg);
                        result.append(msg).append("\n");
                        totalAssignments[0] += updated;
                    }
                } catch (Exception e) {
                    logger.warn("  ⚠️  Could not assign {} to subject {}: {}", staffName, subjectName, e.getMessage());
                }
            });
            
            String summary = String.format("✅ Sync complete: %d total timetable assignments made\n%s", 
                                          totalAssignments[0], result.toString());
            logger.info(summary);
            return ResponseEntity.ok(ApiResponse.success(summary));
            
        } catch (Exception e) {
            logger.error("❌ Error during staff sync: " + e.getMessage(), e);
            return ResponseEntity.badRequest().body(ApiResponse.error("Sync failed: " + e.getMessage()));
        }
    }

    /**
     * GET /api/admin/dashboard/maintenance/debug/staff/{staffId}
     * Admin maintenance endpoint: Inspect timetable_session rows for a staff member
     */
    @GetMapping("/maintenance/debug/staff/{staffId}")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> debugStaffSessions(@PathVariable Long staffId) {
        String sql = """
            SELECT ts.id,
                   ts.subject_id,
                   ts.staff_id,
                   ts.day_of_week,
                   ts.start_time,
                   ts.end_time,
                   ts.department,
                   ts.semester,
                   ts.section,
                   ts.active,
                   sub.name AS subject_name
            FROM timetable_session ts
            LEFT JOIN subject sub ON ts.subject_id = sub.id
            WHERE (ts.staff_id = ? OR ts.staff_id IS NULL)
            ORDER BY FIELD(ts.day_of_week, 'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'), ts.start_time
            """;

        List<Map<String, Object>> rows = jdbcTemplate.queryForList(sql, staffId);
        return ResponseEntity.ok(ApiResponse.success(rows));
    }
}
