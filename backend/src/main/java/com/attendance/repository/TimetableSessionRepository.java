package com.attendance.repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.attendance.model.TimetableSession;
import com.attendance.model.Staff;

public interface TimetableSessionRepository
        extends JpaRepository<TimetableSession, Long> {

    // 🔹 Pending attendance sessions for a given date
    @Query("""
        SELECT t FROM TimetableSession t
        WHERE t.id NOT IN (
            SELECT a.timetableSession.id
            FROM SessionAttendance a
            WHERE a.date = :today
        )
    """)
    List<TimetableSession> findPendingSessions(
            @Param("today") LocalDate today);
    
    // Additional methods for service layer
    List<TimetableSession> findByDepartmentAndSemesterAndActiveTrue(String department, int semester);
    
    List<TimetableSession> findByDepartmentAndSemesterAndDayOfWeekAndActiveTrue(
            String department, int semester, String dayOfWeek);
    
    List<TimetableSession> findByStaffAndDayOfWeekAndActiveTrue(Staff staff, String dayOfWeek);
    
    List<TimetableSession> findByStaffIdAndActiveTrue(Long staffId);
    
    @Query("SELECT ts FROM TimetableSession ts WHERE ts.staff.id = :staffId " +
           "AND ts.dayOfWeek = :dayOfWeek AND ts.active = true ORDER BY ts.startTime")
    List<TimetableSession> findByFacultyIdAndDayOfWeekAndIsActiveTrue(
            @Param("staffId") Long staffId, @Param("dayOfWeek") String dayOfWeek);
    
    List<TimetableSession> findByActiveTrue();
    
    // Staff-specific queries for cascading filters
    List<TimetableSession> findByDepartmentAndActiveTrue(String department);
    
    List<TimetableSession> findByDepartmentAndSemesterAndSectionAndActiveTrue(
            String department, int semester, String section);
}
