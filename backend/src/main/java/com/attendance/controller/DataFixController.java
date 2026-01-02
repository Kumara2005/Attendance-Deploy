package com.attendance.controller;

import com.attendance.dto.ApiResponse;
import com.attendance.model.Student;
import com.attendance.model.TimetableSession;
import com.attendance.repository.StudentRepository;
import com.attendance.repository.TimetableSessionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Data Fix Controller
 * Provides endpoints to fix data inconsistencies using Hibernate
 * NO SQL FILES - All fixes done through JPA/Hibernate
 */
@RestController
@RequestMapping("/api/admin/data-fix")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class DataFixController {

    private static final Logger logger = LoggerFactory.getLogger(DataFixController.class);

    private final TimetableSessionRepository timetableRepository;
    private final StudentRepository studentRepository;

    public DataFixController(TimetableSessionRepository timetableRepository,
                            StudentRepository studentRepository) {
        this.timetableRepository = timetableRepository;
        this.studentRepository = studentRepository;
    }

    /**
     * PERMANENT FIX: Auto-correct semester mismatch between timetable sessions and students
     * This fixes the "0 students" issue in QuickAttendance
     */
    @PostMapping("/fix-semester-mismatch")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ResponseEntity<ApiResponse<Map<String, Object>>> fixSemesterMismatch() {
        logger.info("🔧 Starting semester mismatch fix via Hibernate...");
        
        Map<String, Object> result = new HashMap<>();
        int totalFixed = 0;
        List<String> fixDetails = new ArrayList<>();

        try {
            // Get all active timetable sessions
            List<TimetableSession> allSessions = timetableRepository.findByActiveTrue();
            logger.info("📊 Found {} active timetable sessions to check", allSessions.size());

            // Group by department and section to check each combination
            Map<String, List<TimetableSession>> sessionsByDeptSection = new HashMap<>();
            for (TimetableSession session : allSessions) {
                String key = session.getDepartment() + "_" + session.getSection();
                sessionsByDeptSection.computeIfAbsent(key, k -> new ArrayList<>()).add(session);
            }

            // Check each department/section combination
            for (Map.Entry<String, List<TimetableSession>> entry : sessionsByDeptSection.entrySet()) {
                List<TimetableSession> sessions = entry.getValue();
                if (sessions.isEmpty()) continue;

                TimetableSession sample = sessions.get(0);
                String department = sample.getDepartment();
                String section = sample.getSection();
                int currentSemester = sample.getSemester();

                // Check if students exist for this semester
                List<Student> studentsInCurrentSemester = studentRepository
                    .findByDepartmentAndSemesterAndSectionAndActiveTrue(
                        department, currentSemester, section);

                if (!studentsInCurrentSemester.isEmpty()) {
                    logger.info("✅ {}, Section {}, Semester {} - OK ({} students found)",
                        department, section, currentSemester, studentsInCurrentSemester.size());
                    continue;
                }

                // Mismatch detected - find where students actually are
                logger.warn("⚠️ {}, Section {}, Semester {} - MISMATCH (0 students found)",
                    department, section, currentSemester);

                Integer correctSemester = findCorrectSemester(department, section);
                
                if (correctSemester != null) {
                    // Fix all sessions for this department/section
                    for (TimetableSession session : sessions) {
                        session.setSemester(correctSemester);
                        timetableRepository.save(session);
                        totalFixed++;
                    }

                    List<Student> studentsInCorrectSemester = studentRepository
                        .findByDepartmentAndSemesterAndSectionAndActiveTrue(
                            department, correctSemester, section);

                    String detail = String.format(
                        "%s, Section %s: Changed semester %d → %d (%d sessions updated, %d students available)",
                        department, section, currentSemester, correctSemester,
                        sessions.size(), studentsInCorrectSemester.size()
                    );
                    fixDetails.add(detail);
                    logger.info("🔧 " + detail);
                } else {
                    String warning = String.format(
                        "%s, Section %s: No students found in any semester (skipped)",
                        department, section
                    );
                    fixDetails.add(warning);
                    logger.warn("⚠️ " + warning);
                }
            }

            result.put("totalSessionsFixed", totalFixed);
            result.put("details", fixDetails);
            result.put("status", totalFixed > 0 ? "SUCCESS" : "NO_CHANGES_NEEDED");
            
            if (totalFixed > 0) {
                logger.info("✅ Semester mismatch fix completed: {} sessions updated", totalFixed);
                return ResponseEntity.ok(ApiResponse.success(
                    String.format("Successfully fixed %d timetable sessions", totalFixed), result));
            } else {
                logger.info("ℹ️ No semester mismatches found - all sessions are correct");
                return ResponseEntity.ok(ApiResponse.success(
                    "No mismatches found - all timetable sessions match student enrollment", result));
            }

        } catch (Exception e) {
            logger.error("❌ Error fixing semester mismatch: {}", e.getMessage(), e);
            result.put("error", e.getMessage());
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("Failed to fix semester mismatch: " + e.getMessage()));
        }
    }

    /**
     * Find the correct semester where students are actually enrolled
     */
    private Integer findCorrectSemester(String department, String section) {
        // Check semesters 1-8 to find where students exist
        for (int sem = 1; sem <= 8; sem++) {
            List<Student> students = studentRepository
                .findByDepartmentAndSemesterAndSectionAndActiveTrue(department, sem, section);
            if (!students.isEmpty()) {
                return sem;
            }
        }
        return null; // No students found in any semester
    }

    /**
     * Diagnostic endpoint: Show current semester distribution
     */
    @GetMapping("/semester-distribution")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSemesterDistribution() {
        Map<String, Object> distribution = new HashMap<>();

        try {
            // Get student distribution (all students from repository)
            List<Student> allStudents = studentRepository.findAll();
            Map<String, Integer> studentsByDeptSem = new HashMap<>();
            
            for (Student student : allStudents) {
                if (student.isActive()) {
                    String key = String.format("%s, Semester %d, Section %s",
                        student.getDepartment(), student.getSemester(), student.getSection());
                    studentsByDeptSem.put(key, studentsByDeptSem.getOrDefault(key, 0) + 1);
                }
            }

            // Get timetable session distribution
            List<TimetableSession> allSessions = timetableRepository.findByActiveTrue();
            Map<String, Integer> sessionsByDeptSem = new HashMap<>();
            
            for (TimetableSession session : allSessions) {
                String key = String.format("%s, Semester %d, Section %s",
                    session.getDepartment(), session.getSemester(), session.getSection());
                sessionsByDeptSem.put(key, sessionsByDeptSem.getOrDefault(key, 0) + 1);
            }

            distribution.put("students", studentsByDeptSem);
            distribution.put("timetableSessions", sessionsByDeptSem);

            // Detect mismatches
            List<String> mismatches = new ArrayList<>();
            for (String sessionKey : sessionsByDeptSem.keySet()) {
                if (!studentsByDeptSem.containsKey(sessionKey)) {
                    mismatches.add(sessionKey + " (sessions exist but no students)");
                }
            }
            distribution.put("mismatches", mismatches);

            return ResponseEntity.ok(ApiResponse.success(distribution));

        } catch (Exception e) {
            logger.error("Error getting semester distribution: {}", e.getMessage());
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("Failed to get distribution: " + e.getMessage()));
        }
    }
    
    /**
     * Fix section mismatch between students and timetable sessions
     * Updates student section to match timetable session section
     */
    @PostMapping("/fix-section-mismatch")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ResponseEntity<ApiResponse<Map<String, Object>>> fixSectionMismatch() {
        logger.info("🔧 Starting section mismatch fix...");
        
        Map<String, Object> result = new HashMap<>();
        int totalFixed = 0;
        List<String> fixDetails = new ArrayList<>();

        try {
            // Get all active students
            List<Student> allStudents = studentRepository.findAll().stream()
                .filter(Student::isActive)
                .collect(Collectors.toList());
            
            // Get all active sessions
            List<TimetableSession> allSessions = timetableRepository.findByActiveTrue();
            
            logger.info("📊 Found {} students and {} sessions", allStudents.size(), allSessions.size());
            
            // Group students by department + semester
            Map<String, List<Student>> studentsByDeptSem = allStudents.stream()
                .collect(Collectors.groupingBy(s -> s.getDepartment() + "_" + s.getSemester()));
            
            // Check each group
            for (Map.Entry<String, List<Student>> entry : studentsByDeptSem.entrySet()) {
                List<Student> students = entry.getValue();
                if (students.isEmpty()) continue;
                
                String department = students.get(0).getDepartment();
                int semester = students.get(0).getSemester();
                
                // Find matching sessions for this dept/semester
                List<TimetableSession> matchingSessions = allSessions.stream()
                    .filter(s -> s.getDepartment().equals(department) && s.getSemester() == semester)
                    .collect(Collectors.toList());
                
                if (!matchingSessions.isEmpty()) {
                    // Get the section from the first session
                    String correctSection = matchingSessions.get(0).getSection();
                    
                    // Fix all students with wrong section
                    for (Student student : students) {
                        if (!student.getSection().equals(correctSection)) {
                            String oldSection = student.getSection();
                            student.setSection(correctSection);
                            studentRepository.save(student);
                            totalFixed++;
                            
                            String detail = String.format("%s (Roll: %s): section %s → %s", 
                                student.getName(), student.getRollNo(), oldSection, correctSection);
                            fixDetails.add(detail);
                            logger.info("🔧 Fixed: {}", detail);
                        }
                    }
                }
            }
            
            result.put("totalFixed", totalFixed);
            result.put("details", fixDetails);
            logger.info("✅ Section mismatch fix complete: {} students updated", totalFixed);
            
            return ResponseEntity.ok(ApiResponse.success(result));

        } catch (Exception e) {
            logger.error("❌ Error fixing section mismatch: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("Failed to fix section mismatch: " + e.getMessage()));
        }
    }
}
