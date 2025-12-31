package com.attendance.controller;

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
    public ResponseEntity<?> getAllClasses() {
        try {
            List<ClassDTO> classes = classService.getAllClasses();
            return ResponseEntity.ok().body(Map.of(
                    "status", "success",
                    "message", "Classes retrieved successfully",
                    "data", classes
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "status", "error",
                    "message", "Failed to retrieve classes: " + e.getMessage()
            ));
        }
    }

    /**
     * Get class by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getClassById(@PathVariable Long id) {
        try {
            Optional<ClassDTO> classDto = classService.getClassById(id);
            if (classDto.isPresent()) {
                return ResponseEntity.ok().body(Map.of(
                        "status", "success",
                        "message", "Class retrieved successfully",
                        "data", classDto.get()
                ));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                        "status", "error",
                        "message", "Class not found"
                ));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "status", "error",
                    "message", "Failed to retrieve class: " + e.getMessage()
            ));
        }
    }

    /**
     * Get classes by department
     */
    @GetMapping("/department/{department}")
    public ResponseEntity<?> getClassesByDepartment(@PathVariable String department) {
        try {
            List<ClassDTO> classes = classService.getClassesByDepartment(department);
            return ResponseEntity.ok().body(Map.of(
                    "status", "success",
                    "message", "Classes retrieved successfully",
                    "data", classes
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "status", "error",
                    "message", "Failed to retrieve classes: " + e.getMessage()
            ));
        }
    }

    /**
     * Get classes by department and year
     */
    @GetMapping("/department/{department}/year/{year}")
    public ResponseEntity<?> getClassesByDepartmentAndYear(
            @PathVariable String department,
            @PathVariable int year) {
        try {
            List<ClassDTO> classes = classService.getClassesByDepartmentAndYear(department, year);
            return ResponseEntity.ok().body(Map.of(
                    "status", "success",
                    "message", "Classes retrieved successfully",
                    "data", classes
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "status", "error",
                    "message", "Failed to retrieve classes: " + e.getMessage()
            ));
        }
    }

    /**
     * Create a new class
     */
    @PostMapping
    public ResponseEntity<?> createClass(@Valid @RequestBody ClassDTO classDTO) {
        try {
            // Check for duplicate
            if (classService.classExists(classDTO.getDepartment(), classDTO.getYear(), 
                    classDTO.getSemester(), classDTO.getSection())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                        "status", "error",
                        "message", "Class with this department, year, semester, and section already exists"
                ));
            }

            ClassDTO createdClass = classService.createClass(classDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "status", "success",
                    "message", "Class created successfully",
                    "data", createdClass
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "status", "error",
                    "message", "Failed to create class: " + e.getMessage()
            ));
        }
    }

    /**
     * Update an existing class
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateClass(
            @PathVariable Long id,
            @Valid @RequestBody ClassDTO classDTO) {
        try {
            Optional<ClassDTO> updatedClass = classService.updateClass(id, classDTO);
            if (updatedClass.isPresent()) {
                return ResponseEntity.ok().body(Map.of(
                        "status", "success",
                        "message", "Class updated successfully",
                        "data", updatedClass.get()
                ));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                        "status", "error",
                        "message", "Class not found"
                ));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "status", "error",
                    "message", "Failed to update class: " + e.getMessage()
            ));
        }
    }

    /**
     * Delete a class
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteClass(@PathVariable Long id) {
        try {
            boolean deleted = classService.deleteClass(id);
            if (deleted) {
                return ResponseEntity.ok().body(Map.of(
                        "status", "success",
                        "message", "Class deleted successfully"
                ));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                        "status", "error",
                        "message", "Class not found"
                ));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "status", "error",
                    "message", "Failed to delete class: " + e.getMessage()
            ));
        }
    }

    /**
     * Check if class exists (for validation)
     */
    @PostMapping("/check-exists")
    public ResponseEntity<?> checkClassExists(@RequestBody ClassDTO classDTO) {
        try {
            boolean exists = classService.classExists(classDTO.getDepartment(), classDTO.getYear(),
                    classDTO.getSemester(), classDTO.getSection());
            return ResponseEntity.ok().body(Map.of(
                    "status", "success",
                    "exists", exists
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "status", "error",
                    "message", "Failed to check class: " + e.getMessage()
            ));
        }
    }
}
