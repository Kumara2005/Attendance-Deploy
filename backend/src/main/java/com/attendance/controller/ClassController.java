package com.attendance.controller;

import com.attendance.dto.ApiResponse;
import com.attendance.dto.ClassDTO;
import com.attendance.service.ClassService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin/classes")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:3000", "http://127.0.0.1:5173"})
public class ClassController {

    @Autowired
    private ClassService classService;

    /**
     * Get all classes
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<ClassDTO>>> getAllClasses() {
        try {
            List<ClassDTO> classes = classService.getAllClasses();
            return ResponseEntity.ok(ApiResponse.success(classes));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve classes: " + e.getMessage()));
        }
    }

    /**
     * Get class by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ClassDTO>> getClassById(@PathVariable Long id) {
        try {
            Optional<ClassDTO> classDto = classService.getClassById(id);
            if (classDto.isPresent()) {
                return ResponseEntity.ok(ApiResponse.success(classDto.get()));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Class not found"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve class: " + e.getMessage()));
        }
    }

    /**
     * Get classes by department
     */
    @GetMapping("/department/{department}")
    public ResponseEntity<ApiResponse<List<ClassDTO>>> getClassesByDepartment(@PathVariable String department) {
        try {
            List<ClassDTO> classes = classService.getClassesByDepartment(department);
            return ResponseEntity.ok(ApiResponse.success(classes));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve classes: " + e.getMessage()));
        }
    }

    /**
     * Get classes by department and year
     */
    @GetMapping("/department/{department}/year/{year}")
    public ResponseEntity<ApiResponse<List<ClassDTO>>> getClassesByDepartmentAndYear(
            @PathVariable String department,
            @PathVariable int year) {
        try {
            List<ClassDTO> classes = classService.getClassesByDepartmentAndYear(department, year);
            return ResponseEntity.ok(ApiResponse.success(classes));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve classes: " + e.getMessage()));
        }
    }

    /**
     * Create a new class
     */
    @PostMapping
    public ResponseEntity<ApiResponse<ClassDTO>> createClass(@Valid @RequestBody ClassDTO classDTO) {
        try {
            // Check for duplicate
            if (classService.classExists(classDTO.getDepartment(), classDTO.getYear(),
                    classDTO.getSemester(), classDTO.getSection())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error("Class with this department, year, semester, and section already exists"));
            }

            ClassDTO createdClass = classService.createClass(classDTO);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Class created successfully", createdClass));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to create class: " + e.getMessage()));
        }
    }

    /**
     * Update an existing class
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ClassDTO>> updateClass(
            @PathVariable Long id,
            @Valid @RequestBody ClassDTO classDTO) {
        try {
            Optional<ClassDTO> updatedClass = classService.updateClass(id, classDTO);
            if (updatedClass.isPresent()) {
                return ResponseEntity.ok(ApiResponse.success("Class updated successfully", updatedClass.get()));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Class not found"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to update class: " + e.getMessage()));
        }
    }

    /**
     * Delete a class
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteClass(@PathVariable Long id) {
        try {
            boolean deleted = classService.deleteClass(id);
            if (deleted) {
                return ResponseEntity.ok(ApiResponse.success("Class deleted successfully", null));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Class not found"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to delete class: " + e.getMessage()));
        }
    }

    /**
     * Check if class exists (for validation)
     */
    @PostMapping("/check-exists")
    public ResponseEntity<ApiResponse<Boolean>> checkClassExists(@RequestBody ClassDTO classDTO) {
        try {
            boolean exists = classService.classExists(classDTO.getDepartment(), classDTO.getYear(),
                    classDTO.getSemester(), classDTO.getSection());
            return ResponseEntity.ok(ApiResponse.success(exists));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to check class: " + e.getMessage()));
        }
    }
}
