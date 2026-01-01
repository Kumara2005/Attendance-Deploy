package com.attendance.controller;

import com.attendance.dto.ApiResponse;
import com.attendance.model.Staff;
import com.attendance.model.Subject;
import com.attendance.model.TimetableSession;
import com.attendance.repository.StaffRepository;
import com.attendance.repository.SubjectRepository;
import com.attendance.repository.TimetableSessionRepository;
import com.attendance.repository.ClassRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Admin Timetable Controller
 * Handles CRUD operations for timetable sessions (Admin only)
 */
@RestController
@RequestMapping("/api/admin/timetable")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3003", "http://localhost:3007", "http://localhost:5173"})
public class AdminTimetableController {

    private final TimetableSessionRepository timetableRepository;
    private final SubjectRepository subjectRepository;
    private final StaffRepository staffRepository;
    private final ClassRepository classRepository;

    public AdminTimetableController(
            TimetableSessionRepository timetableRepository,
            SubjectRepository subjectRepository,
            StaffRepository staffRepository,
            ClassRepository classRepository) {
        this.timetableRepository = timetableRepository;
        this.subjectRepository = subjectRepository;
        this.staffRepository = staffRepository;
        this.classRepository = classRepository;
    }

    /**
     * Create or Update a timetable session
     * Handles grid cell assignments from Admin Portal
     */
    @PostMapping("/session")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createOrUpdateSession(
            @RequestBody TimetableSessionRequest request) {
        try {
            // Validate required fields
            if (request.getDay() == null || request.getPeriodNumber() == null) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Day and period are required"));
            }

            // Find subject (use default/placeholder if not found)
            Subject subject = null;
            if (request.getSubjectCode() != null && !request.getSubjectCode().isEmpty()) {
                subject = subjectRepository.findBySubjectCode(request.getSubjectCode())
                        .orElse(null);
            }
            
            // If subject is still null, try to get any default subject
            if (subject == null) {
                // Get first available subject for department and semester
                subject = subjectRepository
                        .findByDepartmentAndSemester(
                                request.getDepartment(),
                                request.getSemester())
                        .stream()
                        .findFirst()
                        .orElse(null);
            }

            // Find staff (optional - can be null for now)
            Staff staff = null;
            if (request.getStaffCode() != null && !request.getStaffCode().isEmpty()) {
                staff = staffRepository.findByStaffCode(request.getStaffCode())
                        .orElse(null);
            }
            
            // If staff is still null, get any active staff from department
            if (staff == null) {
                staff = staffRepository
                        .findByDepartmentAndActive(request.getDepartment(), true)
                        .stream()
                        .findFirst()
                        .orElse(null);
            }
            
            // Final check: if no subject or staff available, return error
            if (subject == null || staff == null) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error(
                                "Cannot save: " + 
                                (subject == null ? "No subjects available. " : "") +
                                (staff == null ? "No staff available. " : "") +
                                "Please add subjects and staff for department '" + 
                                request.getDepartment() + "' first."));
            }

            // Check for existing session at this slot
            TimetableSession session = null;
            if (request.getSessionId() != null) {
                session = timetableRepository.findById(request.getSessionId()).orElse(null);
            }

            // If no existing session, check for conflicts at this time slot
            if (session == null) {
                List<TimetableSession> existingSessions = timetableRepository
                        .findByDepartmentAndSemesterAndSectionAndActiveTrue(
                                request.getDepartment(),
                                request.getSemester(),
                                request.getSection()
                        );

                // Check if any session exists at this day and time slot
                for (TimetableSession existing : existingSessions) {
                    if (existing.getDayOfWeek().equals(request.getDay()) &&
                        existing.getStartTime().equals(request.getStartTime())) {
                        session = existing;
                        break;
                    }
                }
            }

            // Create or update session
            if (session == null) {
                session = new TimetableSession();
            }

            session.setDayOfWeek(request.getDay());
            session.setStartTime(request.getStartTime());
            session.setEndTime(request.getEndTime());
            session.setDepartment(request.getDepartment());
            session.setSemester(request.getSemester());
            session.setSection(request.getSection());
            session.setRoomNumber(request.getRoomNumber());
            session.setActive(true);

            if (subject != null) {
                session.setSubject(subject);
            }
            if (staff != null) {
                session.setStaff(staff);
            }

            // Bind classEntity based on department, semester -> year, and section if available
            int year = (request.getSemester() + 1) / 2;
            classRepository.findByDepartmentAndYearAndSemesterAndSection(
                request.getDepartment(), year, request.getSemester(), request.getSection()
            ).ifPresent(session::setClassEntity);

            TimetableSession savedSession = timetableRepository.save(session);

            // Build response
            Map<String, Object> response = new HashMap<>();
            response.put("id", savedSession.getId());
            response.put("dayOfWeek", savedSession.getDayOfWeek());
            response.put("startTime", savedSession.getStartTime());
            response.put("endTime", savedSession.getEndTime());
            response.put("subjectName", savedSession.getSubjectName());
            response.put("staffName", savedSession.getFacultyName());
            response.put("department", savedSession.getDepartment());
            response.put("semester", savedSession.getSemester());
            response.put("section", savedSession.getSection());
            response.put("message", "Timetable session saved successfully");

            return ResponseEntity.ok(ApiResponse.success(response));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Error saving timetable session: " + e.getMessage()));
        }
    }

    /**
     * Delete a timetable session (or mark as inactive)
     */
    @DeleteMapping("/session/{sessionId}")
    public ResponseEntity<ApiResponse<String>> deleteSession(@PathVariable Long sessionId) {
        try {
            Optional<TimetableSession> sessionOpt = timetableRepository.findById(sessionId);
            
            if (sessionOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            TimetableSession session = sessionOpt.get();
            session.setActive(false);
            timetableRepository.save(session);

            return ResponseEntity.ok(ApiResponse.success("Session deleted successfully"));

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Error deleting session: " + e.getMessage()));
        }
    }

    /**
     * Get all sessions for a department/semester/section (for grid view)
     */
    @GetMapping("/sessions")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getSessions(
            @RequestParam String department,
            @RequestParam int semester,
            @RequestParam String section) {
        try {
            List<TimetableSession> sessions = timetableRepository
                    .findByDepartmentAndSemesterAndSectionAndActiveTrue(department, semester, section);

            List<Map<String, Object>> result = sessions.stream()
                    .map(session -> {
                        Map<String, Object> data = new HashMap<>();
                        data.put("id", session.getId());
                        data.put("dayOfWeek", session.getDayOfWeek());
                        data.put("startTime", session.getStartTime());
                        data.put("endTime", session.getEndTime());
                        data.put("subjectName", session.getSubjectName());
                        data.put("subjectCode", session.getSubjectId());
                        data.put("staffName", session.getFacultyName());
                        data.put("staffCode", session.getFacultyId());
                        data.put("roomNumber", session.getRoomNumber());
                        return data;
                    })
                    .toList();

            return ResponseEntity.ok(ApiResponse.success(result));

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Error fetching sessions: " + e.getMessage()));
        }
    }

    /**
     * Get available subjects for a department and semester
     */
    @GetMapping("/subjects")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getSubjects(
            @RequestParam String department,
            @RequestParam int semester) {
        try {
            List<Subject> subjects = subjectRepository.findByDepartmentAndSemester(department, semester);

            List<Map<String, Object>> result = subjects.stream()
                    .map(subject -> {
                        Map<String, Object> data = new HashMap<>();
                        data.put("id", subject.getId());
                        data.put("code", subject.getSubjectCode());
                        data.put("subjectCode", subject.getSubjectCode());
                        data.put("name", subject.getSubjectName());
                        data.put("subjectName", subject.getSubjectName());
                        data.put("department", subject.getDepartment());
                        data.put("semester", subject.getSemester());
                        data.put("credits", subject.getCredits());
                        data.put("isElective", subject.isElective());
                        return data;
                    })
                    .toList();

            return ResponseEntity.ok(ApiResponse.success(result));

        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.success(List.of()));
        }
    }

    /**
     * Get available staff for a department
     */
    @GetMapping("/staff")
    public ResponseEntity<ApiResponse<List<Map<String, String>>>> getStaff(
            @RequestParam String department) {
        try {
            List<Staff> staffList = staffRepository.findByDepartmentAndActive(department, true);

            List<Map<String, String>> result = staffList.stream()
                    .map(staff -> {
                        Map<String, String> data = new HashMap<>();
                        data.put("code", staff.getStaffCode());
                        data.put("name", staff.getName());
                        return data;
                    })
                    .toList();

            return ResponseEntity.ok(ApiResponse.success(result));

        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.success(List.of()));
        }
    }

    /**
     * Request DTO for timetable session
     */
    public static class TimetableSessionRequest {
        private Long sessionId;
        private String day;
        private Integer periodNumber;
        private LocalTime startTime;
        private LocalTime endTime;
        private String subjectCode;
        private String staffCode;
        private String department;
        private int semester;
        private String section;
        private String roomNumber;

        // Getters and Setters
        public Long getSessionId() { return sessionId; }
        public void setSessionId(Long sessionId) { this.sessionId = sessionId; }

        public String getDay() { return day; }
        public void setDay(String day) { this.day = day; }

        public Integer getPeriodNumber() { return periodNumber; }
        public void setPeriodNumber(Integer periodNumber) { this.periodNumber = periodNumber; }

        public LocalTime getStartTime() { return startTime; }
        public void setStartTime(LocalTime startTime) { this.startTime = startTime; }

        public LocalTime getEndTime() { return endTime; }
        public void setEndTime(LocalTime endTime) { this.endTime = endTime; }

        public String getSubjectCode() { return subjectCode; }
        public void setSubjectCode(String subjectCode) { this.subjectCode = subjectCode; }

        public String getStaffCode() { return staffCode; }
        public void setStaffCode(String staffCode) { this.staffCode = staffCode; }

        public String getDepartment() { return department; }
        public void setDepartment(String department) { this.department = department; }

        public int getSemester() { return semester; }
        public void setSemester(int semester) { this.semester = semester; }

        public String getSection() { return section; }
        public void setSection(String section) { this.section = section; }

        public String getRoomNumber() { return roomNumber; }
        public void setRoomNumber(String roomNumber) { this.roomNumber = roomNumber; }
    }
}
