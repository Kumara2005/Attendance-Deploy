package com.attendance.controller;

import java.time.LocalDate;
import java.util.List;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import com.attendance.model.SessionAttendance;
import com.attendance.model.Student;
import com.attendance.model.TimetableSession;
import com.attendance.model.AttendanceStatus;
import com.attendance.repository.StudentRepository;
import com.attendance.repository.TimetableSessionRepository;
import com.attendance.repository.SessionAttendanceRepository;
import com.attendance.dto.ApiResponse;

/**
 * Test Data Controller
 * Provides endpoints to seed test data for development/testing
 * IMPORTANT: Remove in production!
 */
@RestController
@RequestMapping("/api/test")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173", "http://192.168.56.1:3000"})
public class TestDataController {

    private final StudentRepository studentRepository;
    private final TimetableSessionRepository timetableSessionRepository;
    private final SessionAttendanceRepository sessionAttendanceRepository;

    public TestDataController(StudentRepository studentRepository, 
                              TimetableSessionRepository timetableSessionRepository,
                              SessionAttendanceRepository sessionAttendanceRepository) {
        this.studentRepository = studentRepository;
        this.timetableSessionRepository = timetableSessionRepository;
        this.sessionAttendanceRepository = sessionAttendanceRepository;
    }

    /**
     * POST /api/test/seed-attendance
     * Seeds sample attendance data for today
     * 
     * Usage: curl -X POST https://attendance-management-g2g6.onrender.com/api/test/seed-attendance
     */
    @PostMapping("/seed-attendance")
    public ResponseEntity<ApiResponse<String>> seedAttendanceData(
            @RequestParam(defaultValue = "Computer Science") String department,
            @RequestParam(defaultValue = "1") Integer semester,
            @RequestParam(defaultValue = "A") String section) {
        
        try {
            // Get all students matching the filters
            List<Student> students = studentRepository.findByDepartmentAndSemesterAndSectionAndActiveTrue(
                    department, semester, section);
            
            if (students.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("No students found for: " + department + 
                                           " Semester " + semester + " Section " + section));
            }

            // Get timetable sessions
            List<TimetableSession> sessions = timetableSessionRepository
                    .findByDepartmentAndSemesterAndSectionAndActiveTrue(department, semester, section);
            
            if (sessions.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("No timetable sessions found for: " + department + 
                                           " Semester " + semester + " Section " + section));
            }

            LocalDate today = LocalDate.now();
            int createdCount = 0;

            // Create attendance for first 4 sessions
            for (int sessionIdx = 0; sessionIdx < Math.min(4, sessions.size()); sessionIdx++) {
                TimetableSession session = sessions.get(sessionIdx);
                
                // Mark attendance for each student
                for (int studentIdx = 0; studentIdx < students.size(); studentIdx++) {
                    Student student = students.get(studentIdx);
                    
                    // Vary attendance: first 7 present, next 2 absent, last one OD
                    AttendanceStatus status;
                    if (studentIdx < 7) {
                        status = AttendanceStatus.PRESENT;
                    } else if (studentIdx < 9) {
                        status = AttendanceStatus.ABSENT;
                    } else {
                        status = AttendanceStatus.OD;
                    }

                    // Create attendance record
                    SessionAttendance attendance = new SessionAttendance();
                    attendance.setStudent(student);
                    attendance.setTimetableSession(session);
                    attendance.setDate(today);
                    attendance.setStatus(status);

                    sessionAttendanceRepository.save(attendance);
                    createdCount++;
                }
            }

            String message = String.format(
                "✅ Seeded %d attendance records for %s (Sem %d, Sec %s) on %s",
                createdCount, department, semester, section, today);
            
            System.out.println(message);
            return ResponseEntity.ok(ApiResponse.success(message));

        } catch (Exception e) {
            System.err.println("❌ Error seeding attendance data: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Error seeding data: " + e.getMessage()));
        }
    }

    /**
     * GET /api/test/attendance-count
     * Returns count of attendance records
     */
    @GetMapping("/attendance-count")
    public ResponseEntity<ApiResponse<Long>> getAttendanceCount(
            @RequestParam(required = false) String date) {
        
        try {
            long count;
            if (date != null && !date.isEmpty()) {
                LocalDate targetDate = LocalDate.parse(date);
                count = sessionAttendanceRepository.findByDate(targetDate).size();
            } else {
                count = sessionAttendanceRepository.count();
            }
            
            return ResponseEntity.ok(ApiResponse.success(count));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Error: " + e.getMessage()));
        }
    }

    /**
     * POST /api/test/clear-attendance
     * Clears all attendance records (USE WITH CAUTION!)
     */
    @PostMapping("/clear-attendance")
    public ResponseEntity<ApiResponse<String>> clearAttendanceData() {
        try {
            sessionAttendanceRepository.deleteAll();
            String message = "✅ All attendance records cleared";
            System.out.println(message);
            return ResponseEntity.ok(ApiResponse.success(message));
        } catch (Exception e) {
            System.err.println("❌ Error clearing attendance: " + e.getMessage());
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Error: " + e.getMessage()));
        }
    }
}
