package com.attendance.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.attendance.model.Student;
import com.attendance.service.AttendanceReportService;

@RestController
@RequestMapping("/api/admin/alerts")
public class AdminAttendanceController {

    private final AttendanceReportService service;

    public AdminAttendanceController(AttendanceReportService service) {
        this.service = service;
    }

    // 🔹 LOW ATTENDANCE ALERT API (ADD THIS HERE)
    @GetMapping("/low-attendance")
    public List<Student> alerts() {
        return service.lowAttendanceStudents();
    }
}
