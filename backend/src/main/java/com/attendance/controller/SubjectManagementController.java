package com.attendance.controller;

import com.attendance.dto.ApiResponse;
import com.attendance.dto.SubjectWithStaffDTO;
import com.attendance.model.Subject;
import com.attendance.model.Staff;
import com.attendance.model.TimetableSession;
import com.attendance.repository.SubjectRepository;
import com.attendance.repository.StaffRepository;
import com.attendance.repository.TimetableSessionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Subject Management Controller (Admin Only)
 * Handles full CRUD operations for subjects with security and validation
 */
@RestController
@RequestMapping("/api/admin/subjects")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3003", "http://localhost:3007", "http://localhost:5173"})
public class SubjectManagementController {

    private final SubjectRepository subjectRepository;
    private final StaffRepository staffRepository;
    private final TimetableSessionRepository timetableSessionRepository;

    public SubjectManagementController(
            SubjectRepository subjectRepository,
            StaffRepository staffRepository,
            TimetableSessionRepository timetableSessionRepository) {
        this.subjectRepository = subjectRepository;
        this.staffRepository = staffRepository;
        this.timetableSessionRepository = timetableSessionRepository;
    }

    /**
     * GET /api/admin/subjects: Fetch all subjects filtered by department/semester
     * Example: GET /api/admin/subjects?department=Computer Science&semester=1
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAllSubjects(
            @RequestParam(required = false) String department,
            @RequestParam(required = false) Integer semester) {
        try {
            List<Subject> subjects;
            
            // Apply filters if provided
            if (department != null && semester != null) {
                subjects = subjectRepository.findByDepartmentAndSemester(department, semester);
            } else if (department != null) {
                subjects = subjectRepository.findByDepartment(department);
            } else {
                subjects = subjectRepository.findAll();
            }
            
            List<Map<String, Object>> result = subjects.stream()
                    .map(this::subjectToMap)
                    .toList();
            return ResponseEntity.ok(ApiResponse.success(result));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Error fetching subjects: " + e.getMessage()));
        }
    }

    /**
     * GET /api/admin/subjects/with-staff: Fetch only subjects that have staff assigned
     * Used for timetable management to prevent creating sessions without staff
     * Returns subjects with staff regardless of semester (staff can teach in any semester)
     * Example: GET /api/admin/subjects/with-staff?department=Computer Science
     */
    @GetMapping("/with-staff")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<SubjectWithStaffDTO>>> getSubjectsWithStaff(
            @RequestParam(required = false) String department,
            @RequestParam(required = false) Integer semester) {
        try {
            List<Subject> subjects;
            
            // Get all subjects (or filter by department only)
            // NOTE: We DON'T filter by semester - staff can teach their subject in any semester
            if (department != null) {
                subjects = subjectRepository.findByDepartment(department);
            } else {
                subjects = subjectRepository.findAll();
            }
            
            // Filter to only subjects with assigned staff and map to DTO
            List<SubjectWithStaffDTO> result = subjects.stream()
                    .map(subject -> {
                        // Find staff assigned to this subject (check both subject string field and subjects collection)
                        List<Staff> assignedStaff = staffRepository.findAll().stream()
                                .filter(staff -> {
                                    // Check if staff has this subject in the subjects collection
                                    boolean inCollection = staff.getSubjects() != null && 
                                                          staff.getSubjects().contains(subject);
                                    
                                    // Check if staff has this subject name in the subject string field
                                    boolean matchesSubjectName = staff.getSubject() != null && 
                                                                staff.getSubject().equalsIgnoreCase(subject.getSubjectName());
                                    
                                    return inCollection || matchesSubjectName;
                                })
                                .collect(Collectors.toList());
                        
                        if (assignedStaff.isEmpty()) {
                            return null; // Skip subjects without staff
                        }
                        
                        // Map staff to DTO
                        List<SubjectWithStaffDTO.StaffInfoDTO> staffDTOs = assignedStaff.stream()
                                .map(staff -> new SubjectWithStaffDTO.StaffInfoDTO(
                                        staff.getId(),
                                        staff.getName(),
                                        staff.getEmployeeCode(),
                                        staff.getEmail()
                                ))
                                .collect(Collectors.toList());
                        
                        return new SubjectWithStaffDTO(
                                subject.getId(),
                                subject.getSubjectCode(),
                                subject.getSubjectName(),
                                subject.getCredits(),
                                subject.getDepartment(),
                                subject.getSemester(),
                                staffDTOs
                        );
                    })
                    .filter(dto -> dto != null) // Remove nulls (subjects without staff)
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(ApiResponse.success(result));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Error fetching subjects with staff: " + e.getMessage()));
        }
    }

    /**
     * Get subject by ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSubjectById(@PathVariable Long id) {
        try {
            Optional<Subject> subjectOpt = subjectRepository.findById(id);
            if (subjectOpt.isEmpty()) {
                return ResponseEntity.status(404)
                        .body(ApiResponse.error("Subject not found with ID: " + id));
            }
            return ResponseEntity.ok(ApiResponse.success(subjectToMap(subjectOpt.get())));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Error fetching subject: " + e.getMessage()));
        }
    }

    /**
     * POST /api/admin/subjects: Add a new subject to the registry
     * Admin only - validates unique subject_code and valid semester
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createSubject(
            @Valid @RequestBody SubjectRequest request) {
        try {
            // Validate required fields
            if (request.getSubjectCode() == null || request.getSubjectCode().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Subject code is required"));
            }
            if (request.getSubjectName() == null || request.getSubjectName().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Subject name is required"));
            }
            if (request.getDepartment() == null || request.getDepartment().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Department is required"));
            }
            if (request.getSemester() == null || request.getSemester() < 1 || request.getSemester() > 8) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Valid semester (1-8) is required"));
            }

            // Ensure subject_code is unique
            Optional<Subject> existing = subjectRepository.findBySubjectCode(request.getSubjectCode().trim());
            if (existing.isPresent()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Subject code '" + request.getSubjectCode() + "' already exists"));
            }

            Subject subject = new Subject();
            subject.setSubjectCode(request.getSubjectCode().trim().toUpperCase());
            subject.setSubjectName(request.getSubjectName().trim());
            subject.setDepartment(request.getDepartment().trim());
            subject.setSemester(request.getSemester());
            subject.setCredits(request.getCredits() != null && request.getCredits() > 0 ? request.getCredits() : 3);
            subject.setElective(request.getIsElective() != null ? request.getIsElective() : false);

            Subject savedSubject = subjectRepository.save(subject);

            return ResponseEntity.ok(ApiResponse.success(
                    "Subject created successfully",
                    subjectToMap(savedSubject)
            ));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Error creating subject: " + e.getMessage()));
        }
    }

    /**
     * PUT /api/admin/subjects/{id}: Update existing subject details (Name, Code, Credits)
     * Admin only - validates semester range
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateSubject(
            @PathVariable Long id,
            @Valid @RequestBody SubjectRequest request) {
        try {
            Optional<Subject> subjectOpt = subjectRepository.findById(id);
            if (subjectOpt.isEmpty()) {
                return ResponseEntity.status(404)
                        .body(ApiResponse.error("Subject not found with ID: " + id));
            }

            Subject subject = subjectOpt.get();

            // Validate semester if provided
            if (request.getSemester() != null && (request.getSemester() < 1 || request.getSemester() > 8)) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Semester must be between 1 and 8"));
            }

            // Update fields if provided
            if (request.getSubjectName() != null && !request.getSubjectName().trim().isEmpty()) {
                subject.setSubjectName(request.getSubjectName().trim());
            }
            if (request.getDepartment() != null && !request.getDepartment().trim().isEmpty()) {
                subject.setDepartment(request.getDepartment().trim());
            }
            if (request.getSemester() != null) {
                subject.setSemester(request.getSemester());
            }
            if (request.getCredits() != null && request.getCredits() > 0) {
                subject.setCredits(request.getCredits());
            }
            if (request.getIsElective() != null) {
                subject.setElective(request.getIsElective());
            }
            // Note: subject_code is not updated to maintain integrity

            Subject updatedSubject = subjectRepository.save(subject);

            return ResponseEntity.ok(ApiResponse.success(
                    "Subject updated successfully",
                    subjectToMap(updatedSubject)
            ));

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Error updating subject: " + e.getMessage()));
        }
    }

    /**
     * DELETE /api/admin/subjects/{id}: Remove a subject
     * Admin only - checks for dependencies in timetable_session before deleting
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> deleteSubject(@PathVariable Long id) {
        try {
            Optional<Subject> subjectOpt = subjectRepository.findById(id);
            if (subjectOpt.isEmpty()) {
                return ResponseEntity.status(404)
                        .body(ApiResponse.error("Subject not found with ID: " + id));
            }

            Subject subject = subjectOpt.get();

            // Check for dependencies in timetable_session
            List<TimetableSession> dependencies = timetableSessionRepository.findBySubjectAndActiveTrue(subject);
            if (!dependencies.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error(
                                "Cannot delete subject '" + subject.getSubjectName() + "'. " +
                                "It is currently assigned to " + dependencies.size() + " active timetable session(s). " +
                                "Please remove or reassign these sessions first."
                        ));
            }

            subjectRepository.deleteById(id);

            return ResponseEntity.ok(ApiResponse.success(
                    "Subject '" + subject.getSubjectName() + "' deleted successfully"
            ));

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Error deleting subject: " + e.getMessage()));
        }
    }

    /**
     * Helper method to convert Subject entity to Map
     */
    private Map<String, Object> subjectToMap(Subject subject) {
        Map<String, Object> data = new HashMap<>();
        data.put("id", subject.getId());
        data.put("subjectCode", subject.getSubjectCode());
        data.put("subjectName", subject.getSubjectName());
        data.put("code", subject.getSubjectCode()); // Alias
        data.put("name", subject.getSubjectName()); // Alias
        data.put("department", subject.getDepartment());
        data.put("semester", subject.getSemester());
        data.put("credits", subject.getCredits());
        data.put("isElective", subject.isElective());
        data.put("createdAt", subject.getCreatedAt());
        data.put("updatedAt", subject.getUpdatedAt());
        return data;
    }

    /**
     * Request DTO for Subject operations with validation
     */
    public static class SubjectRequest {
        private String subjectCode;
        private String subjectName;
        private String department;
        private Integer semester;
        private Integer credits;
        private Boolean isElective;

        // Getters and Setters
        public String getSubjectCode() {
            return subjectCode;
        }

        public void setSubjectCode(String subjectCode) {
            this.subjectCode = subjectCode;
        }

        public String getSubjectName() {
            return subjectName;
        }

        public void setSubjectName(String subjectName) {
            this.subjectName = subjectName;
        }

        public String getDepartment() {
            return department;
        }

        public void setDepartment(String department) {
            this.department = department;
        }

        public Integer getSemester() {
            return semester;
        }

        public void setSemester(Integer semester) {
            this.semester = semester;
        }

        public Integer getCredits() {
            return credits;
        }

        public void setCredits(Integer credits) {
            this.credits = credits;
        }

        public Boolean getIsElective() {
            return isElective;
        }

        public void setIsElective(Boolean isElective) {
            this.isElective = isElective;
        }
    }
}
