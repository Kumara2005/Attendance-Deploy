package com.attendance.service;

import java.time.LocalDate;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.attendance.model.SessionAttendance;
import com.attendance.repository.SessionAttendanceRepository;

@Service
public class SessionAttendanceService {

    private final SessionAttendanceRepository repo;

    public SessionAttendanceService(SessionAttendanceRepository repo) {
        this.repo = repo;
    }

    public SessionAttendance mark(SessionAttendance attendance) {

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
