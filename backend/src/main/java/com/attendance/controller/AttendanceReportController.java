package com.attendance.controller;

import java.time.LocalDate;
import java.util.List;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import com.attendance.model.SessionAttendance;
import com.attendance.service.AttendanceReportService;
import com.attendance.dto.ApiResponse;

@RestController
@RequestMapping("/api/reports")
public class AttendanceReportController {

    private final AttendanceReportService service;

    public AttendanceReportController(AttendanceReportService service) {
        this.service = service;
    }

    @GetMapping("/daily")
    public ResponseEntity<ApiResponse<List<SessionAttendance>>> daily(@RequestParam String date) {
        List<SessionAttendance> result = service.daily(LocalDate.parse(date));
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/monthly")
    public ResponseEntity<ApiResponse<List<SessionAttendance>>> monthly(
            @RequestParam int year,
            @RequestParam int month) {
        List<SessionAttendance> result = service.monthly(year, month);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/semester")
    public ResponseEntity<ApiResponse<List<SessionAttendance>>> semester(
            @RequestParam String from,
            @RequestParam String to) {
        List<SessionAttendance> result = service.semester(
                LocalDate.parse(from),
                LocalDate.parse(to));
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/subject/{subjectId}")
    public ResponseEntity<ApiResponse<List<SessionAttendance>>> subject(@PathVariable Long subjectId) {
        List<SessionAttendance> result = service.subject(subjectId);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/session/{sessionId}")
    public ResponseEntity<ApiResponse<List<SessionAttendance>>> session(@PathVariable Long sessionId) {
        List<SessionAttendance> result = service.session(sessionId);
        return ResponseEntity.ok(ApiResponse.success(result));
    }
    
    @GetMapping("/percentage/subject")
    public ResponseEntity<ApiResponse<Double>> subjectPercentage(
            @RequestParam Long studentId,
            @RequestParam Long subjectId) {
        double result = service.subjectPercentage(studentId, subjectId);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/percentage/semester")
    public ResponseEntity<ApiResponse<Double>> semesterPercentage(
            @RequestParam Long studentId,
            @RequestParam String from,
            @RequestParam String to) {
        double result = service.semesterPercentage(
            studentId,
            LocalDate.parse(from),
            LocalDate.parse(to)
        );
        return ResponseEntity.ok(ApiResponse.success(result));
    }

}