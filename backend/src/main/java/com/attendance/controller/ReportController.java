package com.attendance.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.attendance.dto.ApiResponse;
import com.attendance.dto.AttendanceReportDTO;
import com.attendance.service.ReportService;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3003", "http://localhost:3007", "http://localhost:5173"})
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    /**
     * GET /api/reports/daily
     * Generate daily attendance report
     * 
     * @param date Target date (YYYY-MM-DD format)
     * @param department Optional department filter
     * @param year Optional year filter (1, 2, or 3)
     */
    @GetMapping("/daily")
    public ResponseEntity<ApiResponse<List<AttendanceReportDTO>>> getDailyReport(
            @RequestParam String date,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) Integer year) {
        
        LocalDate targetDate = LocalDate.parse(date);
        List<AttendanceReportDTO> report = reportService.getDailyReport(targetDate, department, year);
        
        return ResponseEntity.ok(ApiResponse.success(report));
    }

    /**
     * GET /api/reports/periodic
     * Generate periodic (date range) attendance report
     * 
     * @param fromDate Start date (YYYY-MM-DD format)
     * @param toDate End date (YYYY-MM-DD format)
     * @param department Optional department filter
     * @param year Optional year filter (1, 2, or 3)
     */
    @GetMapping("/periodic")
    public ResponseEntity<ApiResponse<List<AttendanceReportDTO>>> getPeriodicReport(
            @RequestParam String fromDate,
            @RequestParam String toDate,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) Integer year) {
        
        LocalDate from = LocalDate.parse(fromDate);
        LocalDate to = LocalDate.parse(toDate);
        List<AttendanceReportDTO> report = reportService.getPeriodicReport(from, to, department, year);
        
        return ResponseEntity.ok(ApiResponse.success(report));
    }

    /**
     * GET /api/reports/semester
     * Generate semester-wise attendance report
     * 
     * @param department Optional department filter
     * @param year Optional year filter (1, 2, or 3)
     * @param semester Optional semester filter (1-6)
     */
    @GetMapping("/semester")
    public ResponseEntity<ApiResponse<List<AttendanceReportDTO>>> getSemesterReport(
            @RequestParam(required = false) String department,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer semester) {
        
        List<AttendanceReportDTO> report = reportService.getSemesterReport(department, year, semester);
        
        return ResponseEntity.ok(ApiResponse.success(report));
    }

    /**
     * GET /api/reports/student/{rollNumber}
     * Generate attendance report for a specific student
     * 
     * @param rollNumber Student roll number
     * @param fromDate Optional start date filter
     * @param toDate Optional end date filter
     */
    @GetMapping("/student/{rollNumber}")
    public ResponseEntity<ApiResponse<AttendanceReportDTO>> getStudentReport(
            @PathVariable String rollNumber,
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate) {
        
        LocalDate from = fromDate != null ? LocalDate.parse(fromDate) : null;
        LocalDate to = toDate != null ? LocalDate.parse(toDate) : null;
        
        AttendanceReportDTO report = reportService.getStudentReport(rollNumber, from, to);
        
        if (report == null) {
            return ResponseEntity.ok(ApiResponse.error("Student not found"));
        }
        
        return ResponseEntity.ok(ApiResponse.success(report));
    }
}
