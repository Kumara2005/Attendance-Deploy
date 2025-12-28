package com.attendance.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.attendance.dto.ApiResponse;
import com.attendance.dto.StudentDashboardDTO;
import com.attendance.model.Student;
import com.attendance.repository.StudentRepository;
import com.attendance.service.StudentDashboardService;

/**
 * Public Student Dashboard API (for testing/demo purposes)
 * Allows accessing student dashboard by roll number without authentication
 */
@RestController
@RequestMapping("/api/students/dashboard")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3003", "http://localhost:5173"})
public class PublicStudentDashboardController {

    private final StudentDashboardService dashboardService;
    private final StudentRepository studentRepository;

    public PublicStudentDashboardController(
            StudentDashboardService dashboardService,
            StudentRepository studentRepository) {
        this.dashboardService = dashboardService;
        this.studentRepository = studentRepository;
    }

    /**
     * GET /api/students/dashboard/{rollNo}
     * Returns complete dashboard data for a student by roll number
     * Example: GET /api/students/dashboard/CS-Y1-100
     */
    @GetMapping("/{rollNo}")
    public ResponseEntity<ApiResponse<StudentDashboardDTO>> getDashboardByRollNo(@PathVariable String rollNo) {
        try {
            // Find student by roll number
            Student student = studentRepository.findByRollNo(rollNo)
                    .orElseThrow(() -> new RuntimeException("Student not found: " + rollNo));
            
            System.out.println("Found student: " + student.getName() + ", user_id: " + (student.getUser() != null ? student.getUser().getId() : "NULL"));
            
            // Get dashboard data using the student's username
            if (student.getUser() != null) {
                String username = student.getUser().getUsername();
                System.out.println("Calling dashboardService with username: " + username);
                StudentDashboardDTO dashboard = dashboardService.getStudentDashboard(username);
                return ResponseEntity.ok(ApiResponse.success(dashboard));
            } else {
                throw new RuntimeException("Student does not have linked user account");
            }
        } catch (Exception e) {
            System.err.println("ERROR in PublicStudentDashboardController: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Error fetching dashboard: " + e.getMessage(), e);
        }
    }
}
