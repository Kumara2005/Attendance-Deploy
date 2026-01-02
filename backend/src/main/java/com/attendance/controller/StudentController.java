package com.attendance.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.attendance.dto.ApiResponse;
import com.attendance.dto.StudentDTO;
import com.attendance.dto.QuickAttendanceStudentDTO;
import com.attendance.service.StudentService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    private final StudentService service;

    public StudentController(StudentService service) {
        this.service = service;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<StudentDTO>> add(@Valid @RequestBody StudentDTO studentDTO) {
        try {
            StudentDTO saved = service.saveDTO(studentDTO);
            return ResponseEntity.ok(ApiResponse.success("Student added successfully", saved));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<List<?>>> getAll(
            @RequestParam(required = false) Long classId,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) Integer semester,
            @RequestParam(required = false) String section) {
        
        System.out.println("🔍 StudentController.getAll() called with:");
        System.out.println("   classId: " + classId);
        System.out.println("   department: " + department);
        System.out.println("   semester: " + semester);
        System.out.println("   section: " + section);
        
        List<?> students;
        if (classId != null) {
            System.out.println("   → Fetching students by classId...");
            students = service.getByClassId(classId);
            System.out.println("   → Found " + students.size() + " students");
        } else if (department != null && semester != null && section != null) {
            System.out.println("   → Fetching filtered students by department+semester+section...");
            // For QuickAttendance, return with mapped field names
            List<StudentDTO> dtos = service.getByDepartmentSemesterSection(department, semester, section);
            students = dtos.stream()
                .map(dto -> {
                    QuickAttendanceStudentDTO qa = new QuickAttendanceStudentDTO();
                    qa.setStudentId(dto.getId());
                    qa.setStudentName(dto.getName());
                    qa.setRollNumber(dto.getRollNo());
                    qa.setDepartment(dto.getDepartment());
                    qa.setSemester(dto.getSemester());
                    qa.setSection(dto.getSection());
                    return qa;
                })
                .collect(Collectors.toList());
            System.out.println("   → Found " + students.size() + " students");
        } else {
            System.out.println("   → Fetching ALL students...");
            students = service.getAllDTO();
            System.out.println("   → Found " + students.size() + " students total");
        }
        return ResponseEntity.ok(ApiResponse.success(students));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<StudentDTO>> getById(@PathVariable Long id) {
        StudentDTO student = service.getById(id);
        return ResponseEntity.ok(ApiResponse.success(student));
    }

    /**
     * DEBUG ENDPOINT: Get all students without filters
     * This is for troubleshooting only - shows exactly what's in the database
     */
    @GetMapping("/debug/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<List<StudentDTO>>> getAllDebug() {
        System.out.println("🐛 DEBUG: Fetching ALL students from database (no filters)");
        List<StudentDTO> allStudents = service.getAllDTO();
        System.out.println("🐛 DEBUG: Total students in database: " + allStudents.size());
        
        if (!allStudents.isEmpty()) {
            System.out.println("🐛 DEBUG: Sample of first 5 students:");
            allStudents.stream().limit(5).forEach(s -> 
                System.out.println("   - " + s.getName() + " | Dept: " + s.getDepartment() + 
                                 " | Sem: " + s.getSemester() + " | Sec: " + s.getSection())
            );
        }
        
        return ResponseEntity.ok(ApiResponse.success(allStudents));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<StudentDTO>> update(
            @PathVariable Long id, 
            @Valid @RequestBody StudentDTO studentDTO) {
        StudentDTO updated = service.update(id, studentDTO);
        return ResponseEntity.ok(ApiResponse.success("Student updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Student deleted successfully", null));
    }
}
