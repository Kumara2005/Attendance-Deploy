package com.attendance.service;

import org.springframework.stereotype.Service;
import com.attendance.dto.StaffDashboardDTO;
import com.attendance.dto.StaffDashboardDTO.AssignedClassDTO;
import com.attendance.dto.StaffDashboardDTO.StaffInfoDTO;
import com.attendance.dto.StaffDashboardDTO.TodaySessionDTO;
import com.attendance.model.Staff;
import com.attendance.model.TimetableSession;
import com.attendance.model.User;
import com.attendance.repository.*;

import java.time.LocalDate;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for Staff/Teacher Dashboard
 * Provides assigned classes in format: [Year] [Department] [Class]
 */
@Service
public class StaffDashboardService {

    private final StaffRepository staffRepository;
    private final TimetableSessionRepository timetableRepository;
    private final StudentRepository studentRepository;
    private final SessionAttendanceRepository attendanceRepository;
    private final UserRepository userRepository;

    public StaffDashboardService(StaffRepository staffRepository,
                                TimetableSessionRepository timetableRepository,
                                StudentRepository studentRepository,
                                SessionAttendanceRepository attendanceRepository,
                                UserRepository userRepository) {
        this.staffRepository = staffRepository;
        this.timetableRepository = timetableRepository;
        this.studentRepository = studentRepository;
        this.attendanceRepository = attendanceRepository;
        this.userRepository = userRepository;
    }

    /**
     * Get complete staff dashboard
     */
    public StaffDashboardDTO getStaffDashboard(String username) {
        Staff staff = findStaffByUsername(username);
        
        // Build staff info
        StaffInfoDTO staffInfo = buildStaffInfo(staff);
        
        // Get assigned classes
        AssignedClassDTO[] assignedClasses = getAssignedClasses(username);
        
        // Get today's sessions
        TodaySessionDTO[] todaySessions = getTodaySessions(username);
        
        return new StaffDashboardDTO(
            staffInfo,
            Arrays.asList(assignedClasses),
            Arrays.asList(todaySessions)
        );
    }

    /**
     * Get all classes assigned to this staff member
     * Format: [Year] [Department] [Class]
     */
    public AssignedClassDTO[] getAssignedClasses(String username) {
        Staff staff = findStaffByUsername(username);
        
        // Get all timetable sessions for this faculty
        List<TimetableSession> sessions = timetableRepository.findByStaffIdAndActiveTrue(staff.getId());
        
        // Group by unique department-semester combinations
        Map<String, List<TimetableSession>> groupedSessions = sessions.stream()
            .collect(Collectors.groupingBy(session -> 
                session.getDepartment() + "|" + session.getSemester()
            ));
        
        return groupedSessions.entrySet().stream()
            .map(entry -> {
                TimetableSession firstSession = entry.getValue().get(0);
                String department = firstSession.getDepartment();
                int semester = firstSession.getSemester();
                String section = firstSession.getSection();
                String year = "Year " + ((semester + 1) / 2);
                
                // Get student count for this department and semester
                Long studentCount = studentRepository.countByDepartmentAndSemester(department, semester);
                
                // Get average attendance for this class
                Double avgAttendance = attendanceRepository
                    .calculateAverageAttendanceByDepartmentAndSemester(department, semester);
                
                return new AssignedClassDTO(
                    year,
                    department,
                    "B.Sc " + department, // className
                    section != null ? section : "A",
                    staff.getSubject(),
                    studentCount.intValue(),
                    avgAttendance != null ? Math.round(avgAttendance * 100.0) / 100.0 : 0.0
                );
            })
            .toArray(AssignedClassDTO[]::new);
    }

    /**
     * Get today's teaching sessions
     */
    public TodaySessionDTO[] getTodaySessions(String username) {
        Staff staff = findStaffByUsername(username);
        
        // Get current day of week
        String today = LocalDate.now().getDayOfWeek()
            .getDisplayName(TextStyle.FULL, Locale.ENGLISH);
        
        // Get today's sessions for this faculty
        List<TimetableSession> todaySessions = timetableRepository
            .findByFacultyIdAndDayOfWeekAndIsActiveTrue(staff.getId(), today);
        
        return todaySessions.stream()
            .sorted(Comparator.comparing(TimetableSession::getStartTime))
            .map(session -> {
                // Check if attendance is marked for this session
                Boolean attendanceMarked = checkAttendanceMarked(session, LocalDate.now());
                
                return new TodaySessionDTO(
                    session.getStartTime().toString(),
                    session.getEndTime().toString(),
                    session.getSubjectName(),
                    String.format("%s %s", session.getYear(), session.getClassName()),
                    session.getLocation(),
                    attendanceMarked
                );
            })
            .toArray(TodaySessionDTO[]::new);
    }

    // ========== HELPER METHODS ==========

    private Staff findStaffByUsername(String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found: " + username));
        return staffRepository.findByUserId(user.getId())
            .orElseThrow(() -> new RuntimeException("Staff not found for user: " + username));
    }

    private StaffInfoDTO buildStaffInfo(Staff staff) {
        return new StaffInfoDTO(
            String.valueOf(staff.getId()),
            staff.getName(),
            staff.getEmail(),
            staff.getDepartment(),
            staff.getSubject(),
            staff.getEmployeeCode()
        );
    }

    private Boolean checkAttendanceMarked(TimetableSession session, LocalDate date) {
        // Check if attendance records exist for this session and date
        return attendanceRepository.existsByTimetableSessionSubjectIdAndDateAndTimetableSessionStartTime(
            session.getSubject().getId(),
            date,
            session.getStartTime()
        );
    }
}
