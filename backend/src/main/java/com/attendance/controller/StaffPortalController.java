package com.attendance.controller;

import com.attendance.dto.ApiResponse;
import com.attendance.model.TimetableSession;
import com.attendance.repository.TimetableSessionRepository;
import com.attendance.repository.StaffRepository;
import com.attendance.model.Staff;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Staff Portal Timetable Controller
 * Handles "My Timetable" section for Staff Portal
 */
@RestController
@RequestMapping("/api/staff")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3007", "http://localhost:5173"})
public class StaffPortalController {

    private final TimetableSessionRepository timetableRepository;
    private final StaffRepository staffRepository;

    public StaffPortalController(TimetableSessionRepository timetableRepository,
                                 StaffRepository staffRepository) {
        this.timetableRepository = timetableRepository;
        this.staffRepository = staffRepository;
    }

    /**
     * Get staff timetable filtered by staff_id (logged-in teacher's schedule only)
     * Use staffCode parameter to identify the teacher
     */
    @GetMapping("/my-timetable")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getMyTimetable(
            @RequestParam String staffCode
    ) {
        try {
            // Find staff by staff code
            Optional<Staff> staffOpt = staffRepository.findByStaffCode(staffCode);
            
            if (staffOpt.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Staff not found"));
            }

            Staff staff = staffOpt.get();
            
            // Fetch only sessions assigned to this staff member
            List<TimetableSession> sessions = timetableRepository
                    .findByStaffIdAndActiveTrue(staff.getId());

            // Transform sessions to include details
            List<Map<String, Object>> result = sessions.stream()
                    .map(session -> {
                        Map<String, Object> sessionData = new HashMap<>();
                        sessionData.put("id", session.getId());
                        sessionData.put("dayOfWeek", session.getDayOfWeek());
                        sessionData.put("startTime", session.getStartTime());
                        sessionData.put("endTime", session.getEndTime());
                        sessionData.put("subjectName", session.getSubjectName());
                        sessionData.put("department", session.getDepartment());
                        sessionData.put("semester", session.getSemester());
                        sessionData.put("section", session.getSection());
                        sessionData.put("roomNumber", session.getRoomNumber());
                        
                        // Build class context: Year X Section Y - Department
                        int year = (session.getSemester() - 1) / 2 + 1;
                        String classContext = String.format("Year %d %s - %s", 
                            year, session.getSection(), session.getDepartment());
                        sessionData.put("classContext", classContext);
                        
                        return sessionData;
                    })
                    .collect(Collectors.toList());

            return ResponseEntity.ok(ApiResponse.success(result));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Error retrieving timetable: " + e.getMessage()));
        }
    }

    /**
     * Get staff timetable for "My Timetable" section
     * Public endpoint - no authentication required
     */
    @GetMapping("/timetable")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getStaffTimetable(
            @RequestParam String department,
            @RequestParam int year,
            @RequestParam String className
    ) {
        try {
            // Calculate semester from year (Year 1 = Semesters 1-2, Year 2 = Semesters 3-4, etc.)
            int semesterStart = (year - 1) * 2 + 1;
            
            // Fetch sessions for both semesters of the year
            List<TimetableSession> sessions = timetableRepository
                    .findByDepartmentAndSemesterAndSectionAndActiveTrue(department, semesterStart, className);
            
            // Also get semester 2 sessions
            List<TimetableSession> sessions2 = timetableRepository
                    .findByDepartmentAndSemesterAndSectionAndActiveTrue(department, semesterStart + 1, className);
            
            sessions.addAll(sessions2);

            // Transform sessions to include class context
            List<Map<String, Object>> result = sessions.stream()
                    .map(session -> {
                        Map<String, Object> sessionData = new HashMap<>();
                        sessionData.put("id", session.getId());
                        sessionData.put("dayOfWeek", session.getDayOfWeek());
                        sessionData.put("startTime", session.getStartTime());
                        sessionData.put("endTime", session.getEndTime());
                        sessionData.put("subjectName", session.getSubjectName());
                        
                        // Build class context string: "Year X Class Y - Department"
                        String classContext = String.format("Year %d %s - %s", 
                            year, className, department);
                        sessionData.put("classContext", classContext);
                        
                        return sessionData;
                    })
                    .collect(Collectors.toList());

            return ResponseEntity.ok(ApiResponse.success(result));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Error retrieving timetable: " + e.getMessage()));
        }
    }

    /**
     * Get available years for staff's department
     */
    @GetMapping("/years")
    public ResponseEntity<ApiResponse<List<Integer>>> getYears(@RequestParam String department) {
        try {
            // Fetch all sessions for the department
            List<TimetableSession> sessions = timetableRepository
                    .findByDepartmentAndActiveTrue(department);
            
            // Extract unique years from semesters (Semester 1-2 = Year 1, 3-4 = Year 2, 5-6 = Year 3)
            List<Integer> years = sessions.stream()
                    .map(session -> (session.getSemester() - 1) / 2 + 1)
                    .distinct()
                    .sorted()
                    .collect(Collectors.toList());
            
            if (years.isEmpty()) {
                years = List.of(1, 2, 3);
            }
            
            return ResponseEntity.ok(ApiResponse.success(years));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.success(List.of(1, 2, 3)));
        }
    }

    /**
     * Get available classes for a specific year and department
     */
    @GetMapping("/classes")
    public ResponseEntity<ApiResponse<List<String>>> getClasses(
            @RequestParam String department,
            @RequestParam int year
    ) {
        try {
            // Calculate semester range for the year
            int semesterStart = (year - 1) * 2 + 1;
            int semesterEnd = semesterStart + 1;
            
            // Fetch sessions for both semesters
            List<TimetableSession> sessions1 = timetableRepository
                    .findByDepartmentAndSemesterAndActiveTrue(department, semesterStart);
            List<TimetableSession> sessions2 = timetableRepository
                    .findByDepartmentAndSemesterAndActiveTrue(department, semesterEnd);
            
            sessions1.addAll(sessions2);
            
            // Extract unique sections/classes
            List<String> classes = sessions1.stream()
                    .map(TimetableSession::getSection)
                    .filter(section -> section != null && !section.isEmpty())
                    .distinct()
                    .sorted()
                    .collect(Collectors.toList());
            
            if (classes.isEmpty()) {
                classes = List.of("A", "B", "C");
            }
            
            return ResponseEntity.ok(ApiResponse.success(classes));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.success(List.of("A", "B", "C")));
        }
    }
}
