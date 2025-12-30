package com.attendance.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.attendance.model.Staff;
import com.attendance.repository.StaffRepository;

@RestController
@RequestMapping("/api/admin/staff")
public class StaffController {

    private final StaffRepository repo;

    public StaffController(StaffRepository repo) {
        this.repo = repo;
    }

    @PostMapping
    public Staff add(@RequestBody Staff staff) {
        return repo.save(staff);
    }

    @GetMapping
    public List<Staff> all() {
        return repo.findAll();
    }

    @PutMapping("/{id}/disable")
    public void disable(@PathVariable Long id) {
        Staff s = repo.findById(id).orElseThrow();
        s.setActive(false);
        repo.save(s);
    }
}
