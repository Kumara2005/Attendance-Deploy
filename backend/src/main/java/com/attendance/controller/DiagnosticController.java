package com.attendance.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Diagnostic Controller
 * Provides database inspection endpoints for troubleshooting
 */
@RestController
@RequestMapping("/api/diagnostic")
@PreAuthorize("hasRole('ADMIN')")
public class DiagnosticController {

    private final JdbcTemplate jdbcTemplate;

    public DiagnosticController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    /**
     * GET /api/diagnostic/database-state
     * Shows complete state of staff-subject-timetable relationships
     */
    @GetMapping("/database-state")
    public ResponseEntity<Map<String, Object>> getDatabaseState() {
        Map<String, Object> state = new HashMap<>();
        
        // 1. All subjects
        String subjectsSql = "SELECT id, code, name, department, semester FROM subject ORDER BY id";
        List<Map<String, Object>> subjects = jdbcTemplate.queryForList(subjectsSql);
        state.put("subjects", subjects);
        
        // 2. All staff with their subjects
        String staffSql = """
            SELECT s.id, s.staff_code, s.name, s.department, s.subject as subject_text,
                   GROUP_CONCAT(sub.id) as subject_ids,
                   GROUP_CONCAT(sub.name) as subject_names
            FROM staff s
            LEFT JOIN staff_subjects ss ON s.id = ss.staff_id
            LEFT JOIN subject sub ON ss.subject_id = sub.id
            WHERE s.active = true
            GROUP BY s.id
            ORDER BY s.id
            """;
        List<Map<String, Object>> staff = jdbcTemplate.queryForList(staffSql);
        state.put("staff", staff);
        
        // 3. All timetable sessions with subject and staff info
        String sessionsSql = """
            SELECT ts.id, ts.day_of_week, ts.start_time, ts.end_time,
                   ts.subject_id, sub.name as subject_name,
                   ts.staff_id, st.name as staff_name,
                   ts.department, ts.semester, ts.section, ts.active
            FROM timetable_session ts
            LEFT JOIN subject sub ON ts.subject_id = sub.id
            LEFT JOIN staff st ON ts.staff_id = st.id
            WHERE ts.active = true
            ORDER BY ts.id
            """;
        List<Map<String, Object>> sessions = jdbcTemplate.queryForList(sessionsSql);
        state.put("timetable_sessions", sessions);
        
        // 4. Analysis: Subjects without timetable sessions
        String orphanSubjectsSql = """
            SELECT sub.id, sub.name, sub.department, sub.semester
            FROM subject sub
            WHERE NOT EXISTS (
                SELECT 1 FROM timetable_session ts 
                WHERE ts.subject_id = sub.id AND ts.active = true
            )
            ORDER BY sub.id
            """;
        List<Map<String, Object>> orphanSubjects = jdbcTemplate.queryForList(orphanSubjectsSql);
        state.put("subjects_without_sessions", orphanSubjects);
        
        // 5. Analysis: Sessions without staff
        String unassignedSessionsSql = """
            SELECT ts.id, ts.day_of_week, ts.start_time,
                   sub.name as subject_name, ts.department, ts.semester
            FROM timetable_session ts
            LEFT JOIN subject sub ON ts.subject_id = sub.id
            WHERE ts.staff_id IS NULL AND ts.active = true
            ORDER BY ts.id
            """;
        List<Map<String, Object>> unassignedSessions = jdbcTemplate.queryForList(unassignedSessionsSql);
        state.put("unassigned_sessions", unassignedSessions);
        
        // 6. Analysis: Staff without sessions
        String staffWithoutSessionsSql = """
            SELECT s.id, s.name, s.staff_code,
                   GROUP_CONCAT(DISTINCT sub.name) as their_subjects
            FROM staff s
            LEFT JOIN staff_subjects ss ON s.id = ss.staff_id
            LEFT JOIN subject sub ON ss.subject_id = sub.id
            WHERE s.active = true
              AND NOT EXISTS (
                  SELECT 1 FROM timetable_session ts WHERE ts.staff_id = s.id AND ts.active = true
              )
            GROUP BY s.id
            ORDER BY s.id
            """;
        List<Map<String, Object>> staffWithoutSessions = jdbcTemplate.queryForList(staffWithoutSessionsSql);
        state.put("staff_without_sessions", staffWithoutSessions);
        
        return ResponseEntity.ok(state);
    }
}
