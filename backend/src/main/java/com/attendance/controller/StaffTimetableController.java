package com.attendance.controller;

import com.attendance.dto.ApiResponse;
import com.attendance.model.TimetableSession;
import com.attendance.model.Student;
import com.attendance.repository.TimetableSessionRepository;
import com.attendance.repository.ClassRepository;
import com.attendance.repository.StudentRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Staff Timetable Controller - Read-Only for Staff Role
 * Only Admin can modify timetable data
 */
@RestController
@RequestMapping("/api/teacher")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3003", "http://localhost:3007", "http://localhost:5173"})
public class StaffTimetableController {

    private final TimetableSessionRepository timetableRepository;
    private final ClassRepository classRepository;
    private final StudentRepository studentRepository;

    public StaffTimetableController(TimetableSessionRepository timetableRepository,
                                   ClassRepository classRepository,
                                   StudentRepository studentRepository) {
        this.timetableRepository = timetableRepository;
        this.classRepository = classRepository;
        this.studentRepository = studentRepository;
    }

    /**
     * Get teacher's schedule with filtering
     * READ-ONLY for STAFF role
     */
    @GetMapping("/schedule")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getTeacherSchedule(
            @RequestParam(required = false) String department,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) String className,
            @RequestParam(required = false) Integer semester
    ) {
        List<TimetableSession> sessions;

        // Apply cascading filters
        if (department != null && year != null && semester != null && className != null) {
            // Most specific: all filters
            sessions = timetableRepository.findByDepartmentAndSemesterAndSectionAndActiveTrue(
                department, semester, className
            );
        } else if (department != null && semester != null) {
            // Department + semester
            sessions = timetableRepository.findByDepartmentAndSemesterAndActiveTrue(
                department, semester
            );
        } else if (department != null) {
            // Department only
            sessions = timetableRepository.findByDepartmentAndActiveTrue(department);
        } else {
            // No filters - return all active sessions
            sessions = timetableRepository.findByActiveTrue();
        }

        // Map to DTO with formatted class context
        List<Map<String, Object>> scheduleData = sessions.stream()
            .map(session -> {
                Map<String, Object> item = new HashMap<>();
                item.put("id", session.getId());
                item.put("dayOfWeek", session.getDayOfWeek());
                item.put("startTime", session.getStartTime().toString());
                item.put("endTime", session.getEndTime().toString());
                item.put("subjectName", session.getSubjectName());
                item.put("facultyName", session.getFacultyName());
                item.put("roomNumber", session.getRoomNumber());
                item.put("department", session.getDepartment());
                item.put("semester", session.getSemester());
                item.put("section", session.getSection());
                
                // Format: [Year] [Class] - [Department Name]
                String sessionYear = session.getYear();
                String section = session.getSection() != null ? session.getSection() : "";
                String classContext = String.format("%s %s - %s", 
                    sessionYear, section, session.getDepartment());
                item.put("classContext", classContext);
                
                return item;
            })
            .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(scheduleData));
    }

    /**
     * Get available years for a department
     */
    @GetMapping("/years")
    public ResponseEntity<ApiResponse<List<Integer>>> getYears(
            @RequestParam String department
    ) {
        List<Integer> years = classRepository.findDistinctYearsByDepartment(department);
        return ResponseEntity.ok(ApiResponse.success(years));
    }

    /**
     * Get available classes (sections) for department, year, and semester
     */
    @GetMapping("/classes")
    public ResponseEntity<ApiResponse<List<String>>> getClasses(
            @RequestParam String department,
            @RequestParam int year,
            @RequestParam int semester
    ) {
        List<String> sections = classRepository.findDistinctSectionsByDepartmentAndYearAndSemester(
            department, year, semester
        );
        return ResponseEntity.ok(ApiResponse.success(sections));
    }

    /**
     * Get students for a specific class filter
     * Used for attendance marking
     */
    @GetMapping("/students")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getStudentsByClass(
            @RequestParam String department,
            @RequestParam int year,
            @RequestParam int semester,
            @RequestParam String section
    ) {
        List<Student> students = studentRepository
            .findByDepartmentAndSemesterAndSectionAndActiveTrue(department, semester, section);
        
        List<Map<String, Object>> studentData = students.stream()
            .map(student -> {
                Map<String, Object> item = new HashMap<>();
                item.put("id", student.getId());
                item.put("rollNo", student.getRollNo());
                item.put("name", student.getName());
                item.put("department", student.getDepartment());
                item.put("semester", student.getSemester());
                item.put("section", student.getSection());
                item.put("email", student.getEmail());
                item.put("phone", student.getPhone());
                return item;
            })
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success(studentData));
    }
}

