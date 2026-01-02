package com.attendance.service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.attendance.model.SessionAttendance;
import com.attendance.model.Student;
import com.attendance.model.TimetableSession;
import com.attendance.dto.AttendanceSubmissionDTO;
import com.attendance.repository.SessionAttendanceRepository;
import com.attendance.repository.TimetableSessionRepository;
import com.attendance.repository.StudentRepository;

@Service
public class SessionAttendanceService {

    private final SessionAttendanceRepository repo;
    private final TimetableSessionRepository timetableSessionRepository;
    private final StudentRepository studentRepository;

    public SessionAttendanceService(SessionAttendanceRepository repo,
                                    TimetableSessionRepository timetableSessionRepository,
                                    StudentRepository studentRepository) {
        this.repo = repo;
        this.timetableSessionRepository = timetableSessionRepository;
        this.studentRepository = studentRepository;
    }

    /**
     * Mark attendance using simplified DTO
     * FIXED: Now requires timetableSessionId - NO AUTO-CREATION
     */
    public SessionAttendance markAttendance(AttendanceSubmissionDTO dto) {
        System.out.println("📝 Processing attendance submission: " + dto);
        
        if (dto.getTimetableSessionId() == null || dto.getTimetableSessionId() <= 0) {
            throw new RuntimeException("timetableSessionId is required and must be > 0");
        }
        
        LocalDate today = LocalDate.now();
        
        // Find Student from DB
        Student student = studentRepository.findById(dto.getStudentId())
            .orElseThrow(() -> new RuntimeException("Student not found with ID: " + dto.getStudentId()));
        
        System.out.println("✅ Found student: " + student.getName());
        
        // Find TimetableSession from DB (REQUIRED - no auto-creation)
        TimetableSession session = timetableSessionRepository.findById(dto.getTimetableSessionId())
            .orElseThrow(() -> new RuntimeException("TimetableSession not found with ID: " + dto.getTimetableSessionId()));
        
        System.out.println("✅ Using session ID: " + session.getId());
        
        // Check if attendance already exists for this session on this date
        Optional<SessionAttendance> existing =
            repo.findByStudentIdAndTimetableSessionIdAndDate(
                student.getId(),
                session.getId(),
                today
            );
        
        SessionAttendance attendance;
        if (existing.isPresent()) {
            System.out.println("📝 Updating existing attendance record");
            attendance = existing.get();
            attendance.setStatus(dto.getStatus());
        } else {
            System.out.println("📝 Creating new attendance record");
            attendance = new SessionAttendance();
            attendance.setStudent(student);
            attendance.setTimetableSession(session);
            attendance.setDate(today);
            attendance.setStatus(dto.getStatus());
        }
        
        // Save and return
        SessionAttendance saved = repo.save(attendance);
        System.out.println("✅ Attendance record saved with ID: " + saved.getId());
        return saved;
    }


    /**
     * Legacy method for backward compatibility
     * FIXED: Now requires valid timetableSession with ID - NO AUTO-CREATION
     */
    public SessionAttendance mark(SessionAttendance attendance) {
        if (attendance.getTimetableSession() == null || 
            attendance.getTimetableSession().getId() == null || 
            attendance.getTimetableSession().getId() == 0) {
            throw new RuntimeException("TimetableSession must be provided with valid ID. Auto-creation is not allowed.");
        }

        LocalDate today = LocalDate.now();

        Optional<SessionAttendance> existing =
            repo.findByStudentIdAndTimetableSessionIdAndDate(
                attendance.getStudent().getId(),
                attendance.getTimetableSession().getId(),
                today
            );

        if (existing.isPresent()) {
            SessionAttendance record = existing.get();
            record.setStatus(attendance.getStatus());
            return repo.save(record);
        }

        attendance.setDate(today);
        return repo.save(attendance);
    }
}
