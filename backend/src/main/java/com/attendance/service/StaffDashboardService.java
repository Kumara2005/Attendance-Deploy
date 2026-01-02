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
        try {
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
        } catch (Exception e) {
            System.err.println("❌ Error in getStaffDashboard for user '" + username + "': " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to get staff dashboard: " + e.getMessage(), e);
        }
    }

    /**
     * Get all classes assigned to this staff member
     * Format: [Year] [Department] [Class]
     */
    public AssignedClassDTO[] getAssignedClasses(String username) {
        try {
            Staff staff = findStaffByUsername(username);
            
            // Get all timetable sessions for this faculty
            List<TimetableSession> sessions = timetableRepository.findByStaffIdAndActiveTrue(staff.getId());
            System.out.println("📚 Found " + sessions.size() + " sessions for staff: " + staff.getName());
            
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

                    // Derive subject from the sessions mapped to this group (use distinct to cover multiple subjects)
                    String subjectName = entry.getValue().stream()
                            .map(TimetableSession::getSubjectName)
                            .filter(Objects::nonNull)
                            .findFirst()
                            .orElse(staff.getSubject());
                    
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
                        subjectName,
                        studentCount.intValue(),
                        avgAttendance != null ? Math.round(avgAttendance * 100.0) / 100.0 : 0.0
                    );
                })
                .toArray(AssignedClassDTO[]::new);
        } catch (Exception e) {
            System.err.println("❌ Error in getAssignedClasses for user '" + username + "': " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to get assigned classes: " + e.getMessage(), e);
        }
    }

    /**
     * Get today's teaching sessions
     */
    public TodaySessionDTO[] getTodaySessions(String username) {
        try {
            Staff staff = findStaffByUsername(username);
            
            // Get current day of week
            String today = LocalDate.now().getDayOfWeek()
                .getDisplayName(TextStyle.FULL, Locale.ENGLISH);
            
            System.out.println("📅 Looking for today's sessions for staff '" + staff.getName() + "' on day: " + today);
            
            // Get today's sessions for this faculty
            List<TimetableSession> todaySessions = timetableRepository
                .findByFacultyIdAndDayOfWeekAndIsActiveTrue(staff.getId(), today);
            
            System.out.println("📚 Found " + todaySessions.size() + " sessions for today");
            
            return todaySessions.stream()
                .sorted(Comparator.comparing(TimetableSession::getStartTime))
                .map(session -> {
                    // Check if attendance is marked for this session
                    Boolean attendanceMarked = checkAttendanceMarked(session, LocalDate.now());
                    
                    Long classId = session.getClassEntity() != null ? session.getClassEntity().getId() : null;
                    
                    return new TodaySessionDTO(
                        session.getStartTime().toString(),
                        session.getEndTime().toString(),
                        session.getSubjectName(),
                        String.format("%s %s", session.getYear(), session.getClassName()),
                        session.getLocation(),
                        attendanceMarked,
                        session.getId(),
                        classId,
                        session.getDepartment(),
                        session.getSemester(),
                        session.getSection()
                    );
                })
                .toArray(TodaySessionDTO[]::new);
        } catch (Exception e) {
            System.err.println("❌ Error in getTodaySessions for user '" + username + "': " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to get today's sessions: " + e.getMessage(), e);
        }
    }

    // ========== HELPER METHODS ==========

    private Staff findStaffByUsername(String username) {
        try {
            // Try case-insensitive lookup first
            User user = userRepository.findByUsernameIgnoreCase(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
            
            Staff staff = staffRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Staff not found for user: " + username));
            
            System.out.println("✅ Found staff: " + staff.getName() + " (ID=" + staff.getId() + ") for user: " + username);
            return staff;
        } catch (Exception e) {
            System.err.println("❌ Error finding staff for username '" + username + "': " + e.getMessage());
            throw new RuntimeException("Failed to find staff for user: " + username, e);
        }
    }

    private StaffInfoDTO buildStaffInfo(Staff staff) {
        List<String> subjects = Optional.ofNullable(staff.getSubjects())
                .orElse(List.of())
                .stream()
                .map(sub -> sub.getSubjectName())
                .filter(Objects::nonNull)
                .toList();
        String primarySubject = !subjects.isEmpty() ? subjects.get(0) : staff.getSubject();
        return new StaffInfoDTO(
            String.valueOf(staff.getId()),
            staff.getName(),
            staff.getEmail(),
            staff.getDepartment(),
            primarySubject,
            subjects,
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
