package com.attendance.controller;

import java.time.LocalDate;
import java.util.List;
import org.springframework.web.bind.annotation.*;
import com.attendance.model.SessionAttendance;
import com.attendance.service.AttendanceReportService;

@RestController
@RequestMapping("/api/reports")
public class AttendanceReportController {

    private final AttendanceReportService service;

    public AttendanceReportController(AttendanceReportService service) {
        this.service = service;
    }

    @GetMapping("/daily")
    public List<SessionAttendance> daily(@RequestParam String date) {
        return service.daily(LocalDate.parse(date));
    }

    @GetMapping("/monthly")
    public List<SessionAttendance> monthly(
            @RequestParam int year,
            @RequestParam int month) {
        return service.monthly(year, month);
    }

    @GetMapping("/semester")
    public List<SessionAttendance> semester(
            @RequestParam String from,
            @RequestParam String to) {
        return service.semester(
                LocalDate.parse(from),
                LocalDate.parse(to));
    }

    @GetMapping("/subject/{subjectId}")
    public List<SessionAttendance> subject(@PathVariable Long subjectId) {
        return service.subject(subjectId);
    }

    @GetMapping("/session/{sessionId}")
    public List<SessionAttendance> session(@PathVariable Long sessionId) {
        return service.session(sessionId);
    }
    
    @GetMapping("/percentage/subject")
    public double subjectPercentage(
            @RequestParam Long studentId,
            @RequestParam Long subjectId) {
        return service.subjectPercentage(studentId, subjectId);
    }

    @GetMapping("/percentage/semester")
    public double semesterPercentage(
            @RequestParam Long studentId,
            @RequestParam String from,
            @RequestParam String to) {

        return service.semesterPercentage(
            studentId,
            LocalDate.parse(from),
            LocalDate.parse(to)
        );
    }

}