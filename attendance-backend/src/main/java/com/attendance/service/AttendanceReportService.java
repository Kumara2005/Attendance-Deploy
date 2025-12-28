package com.attendance.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;

import com.attendance.model.AttendanceStatus;
import com.attendance.model.SessionAttendance;
import com.attendance.model.Student;
import com.attendance.model.SystemSettings;
import com.attendance.repository.SessionAttendanceRepository;
import com.attendance.repository.StudentRepository;
import com.attendance.repository.SystemSettingsRepository;

@Service
public class AttendanceReportService {

    private final SessionAttendanceRepository repo;
    private final StudentRepository studentRepo;
    private final SystemSettingsRepository settingsRepo;

    // ✅ Constructor Injection (CORRECT)
    public AttendanceReportService(
            SessionAttendanceRepository repo,
            StudentRepository studentRepo,
            SystemSettingsRepository settingsRepo) {

        this.repo = repo;
        this.studentRepo = studentRepo;
        this.settingsRepo = settingsRepo;
    }

    // =======================
    // BASIC REPORTS
    // =======================

    // 🔹 Daily attendance report
    public List<SessionAttendance> daily(LocalDate date) {
        return repo.findByDate(date);
    }

    // 🔹 Monthly attendance report (calendar based)
    public List<SessionAttendance> monthly(int year, int month) {
        LocalDate from = LocalDate.of(year, month, 1);
        LocalDate to = from.withDayOfMonth(from.lengthOfMonth());
        return repo.findByDateBetween(from, to);
    }

    // 🔹 Semester attendance report (from–to)
    public List<SessionAttendance> semester(LocalDate from, LocalDate to) {
        return repo.findByDateBetween(from, to);
    }

    // 🔹 Session-wise attendance report
    public List<SessionAttendance> session(Long sessionId) {
        return repo.findByTimetableSessionId(sessionId);
    }

    // 🔹 Subject-wise attendance report
    public List<SessionAttendance> subject(Long subjectId) {
        return repo.findByTimetableSessionSubjectId(subjectId);
    }

    // =======================
    // PERCENTAGE CALCULATIONS
    // =======================

    // 🔹 Subject-wise attendance percentage
    public double subjectPercentage(Long studentId, Long subjectId) {

        List<SessionAttendance> list =
            repo.findByStudentId(studentId).stream()
                .filter(a ->
                    a.getTimetableSession()
                     .getSubject()
                     .getId()
                     .equals(subjectId))
                .toList();

        long total = list.size();
        long present = list.stream()
                .filter(a ->
                    a.getStatus() == AttendanceStatus.PRESENT
                 || a.getStatus() == AttendanceStatus.OD)
                .count();

        return total == 0 ? 0 : (present * 100.0) / total;
    }

    // 🔹 Semester-wise attendance percentage
    public double semesterPercentage(
            Long studentId,
            LocalDate from,
            LocalDate to) {

        List<SessionAttendance> list =
            repo.findByDateBetween(from, to).stream()
                .filter(a ->
                    a.getStudent().getId().equals(studentId))
                .toList();

        long total = list.size();
        long present = list.stream()
                .filter(a ->
                    a.getStatus() == AttendanceStatus.PRESENT
                 || a.getStatus() == AttendanceStatus.OD)
                .count();

        return total == 0 ? 0 : (present * 100.0) / total;
    }

    // =======================
    // LOW ATTENDANCE ALERTS
    // =======================

    public List<Student> lowAttendanceStudents() {

        // Fetch system settings
        // Use default values for semester dates and minimum percentage
        double minPercentage = 75.0; // Default minimum attendance percentage
        LocalDate semesterStart = LocalDate.of(2025, 1, 1);
        LocalDate semesterEnd = LocalDate.of(2025, 6, 30);

        // Filter students below threshold
        return studentRepo.findAll().stream()
            .filter(student -> {
                double percentage = semesterPercentage(
                        student.getId(),
                        semesterStart,
                        semesterEnd
                );
                return percentage < minPercentage;
            })
            .toList();
    }
}
