package com.attendance.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.attendance.dto.ApiResponse;
import com.attendance.dto.StaffRegistrationDTO;
import com.attendance.model.Staff;
import com.attendance.model.User;
import com.attendance.repository.StaffRepository;
import com.attendance.repository.UserRepository;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin/staff")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3007", "http://localhost:5173"})
public class StaffController {

    private final StaffRepository staffRepo;
    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;

    public StaffController(StaffRepository staffRepo, UserRepository userRepo, PasswordEncoder passwordEncoder) {
        this.staffRepo = staffRepo;
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Register a new staff member with automatic user account creation
     * POST /api/admin/staff/register
     */
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Staff>> registerStaff(@Valid @RequestBody StaffRegistrationDTO dto) {
        try {
            // Check if user already exists
            if (userRepo.findByUsername(dto.getEmail()).isPresent()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("User with this email already exists"));
            }
            
            // Check if staff code is already used
            if (staffRepo.findByStaffCode(dto.getStaffCode()).isPresent()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Staff code already in use"));
            }
            
            // Create new User
            User user = new User();
            user.setUsername(dto.getEmail());
            user.setPassword(passwordEncoder.encode(dto.getPassword()));
            user.setRole("ROLE_STAFF"); // Role with ROLE_ prefix
            user.setEnabled(true);
            User savedUser = userRepo.save(user);
            
            // Create new Staff with the created User
            Staff staff = new Staff();
            staff.setStaffCode(dto.getStaffCode());
            staff.setName(dto.getName());
            staff.setDepartment(dto.getDepartment());
            staff.setUser(savedUser);
            staff.setActive(true);
            
            Staff savedStaff = staffRepo.save(staff);
            
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Staff registered successfully", savedStaff));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to register staff: " + e.getMessage()));
        }
    }

    /**
     * Get all staff members
     * GET /api/admin/staff
     */
    @GetMapping
    public List<Staff> all() {
        return staffRepo.findAll();
    }

    /**
     * Create staff directly (legacy endpoint - requires existing user)
     * POST /api/admin/staff
     */
    @PostMapping
    public Staff add(@RequestBody Staff staff) {
        return staffRepo.save(staff);
    }

    /**
     * Get staff by ID
     * GET /api/admin/staff/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Staff>> getById(@PathVariable Long id) {
        return staffRepo.findById(id)
                .map(staff -> ResponseEntity.ok(ApiResponse.success(staff)))
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Update staff
     * PUT /api/admin/staff/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Staff>> update(@PathVariable Long id, @RequestBody Staff staffUpdates) {
        return staffRepo.findById(id)
                .map(staff -> {
                    staff.setName(staffUpdates.getName());
                    staff.setDepartment(staffUpdates.getDepartment());
                    Staff updated = staffRepo.save(staff);
                    return ResponseEntity.ok(ApiResponse.success("Staff updated successfully", updated));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Disable staff member
     * PUT /api/admin/staff/{id}/disable
     */
    @PutMapping("/{id}/disable")
    public ResponseEntity<ApiResponse<Void>> disable(@PathVariable Long id) {
        return staffRepo.findById(id)
                .map(staff -> {
                    staff.setActive(false);
                    staffRepo.save(staff);
                    return ResponseEntity.ok(ApiResponse.<Void>success("Staff disabled successfully", null));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Delete staff member
     * DELETE /api/admin/staff/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        if (!staffRepo.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        staffRepo.deleteById(id);
        return ResponseEntity.ok(ApiResponse.<Void>success("Staff deleted successfully", null));
    }
}

