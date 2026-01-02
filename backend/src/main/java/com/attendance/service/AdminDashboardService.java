package com.attendance.service;

import org.springframework.stereotype.Service;
import com.attendance.dto.AdminDashboardDTO;
import com.attendance.dto.AdminDashboardDTO.ProgrammeDTO;
import com.attendance.repository.*;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service for Admin Dashboard
 * Generates Curriculum Registry and Programme cards
 */
@Service
public class AdminDashboardService {

    private final StudentRepository studentRepository;
    private final StaffRepository staffRepository;
    private final SessionAttendanceRepository attendanceRepository;
    private final ClassRepository classRepository;

    public AdminDashboardService(StudentRepository studentRepository,
                                StaffRepository staffRepository,
                                SessionAttendanceRepository attendanceRepository,
                                ClassRepository classRepository) {
        this.studentRepository = studentRepository;
        this.staffRepository = staffRepository;
        this.attendanceRepository = attendanceRepository;
        this.classRepository = classRepository;
    }

    /**
     * Get complete admin dashboard
     */
    public AdminDashboardDTO getAdminDashboard() {
        List<ProgrammeDTO> programmes = getAllProgrammes();
        
        // Get overall statistics
        Long totalStudents = studentRepository.count();
        Long totalStaff = staffRepository.count();
        Integer totalClasses = calculateTotalClasses();
        Double overallAttendance = calculateOverallAttendance();
        
        return new AdminDashboardDTO(
            programmes,
            totalStudents.intValue(),
            totalStaff.intValue(),
            totalClasses,
            overallAttendance
        );
    }

    /**
     * Get all programmes for Curriculum Registry
     * Groups students and faculty by department
     * FIXED: Now reads from classes table with JOIN to students
     */
    public List<ProgrammeDTO> getAllProgrammes() {
        // Get all departments from classes table with student counts via JOIN
        List<Object[]> departmentData = classRepository.findDepartmentStatisticsFromClasses();
        
        return departmentData.stream()
            .map(row -> {
                String department = (String) row[0];
                Long classCount = (Long) row[1];
                Long studentCount = (Long) row[2];
                
                // Get faculty count for this department
                Long facultyCount = staffRepository.countByDepartment(department);
                
                // Get distinct years for this department from classes table
                List<String> years = classRepository.findDistinctYearsStringByDepartment(department);
                
                // Calculate average attendance for this department
                Double avgAttendance = calculateDepartmentAttendance(department);
                
                return new ProgrammeDTO(
                    department, // Programme name = Department name
                    department,
                    studentCount.intValue(),
                    facultyCount.intValue(),
                    avgAttendance,
                    years
                );
            })
            .collect(Collectors.toList());
    }

    // ========== HELPER METHODS ==========

    private Double calculateDepartmentAttendance(String department) {
        Double avg = attendanceRepository.calculateAverageAttendanceByDepartment(department);
        return avg != null ? Math.round(avg * 100.0) / 100.0 : 0.0;
    }

    private Integer calculateTotalClasses() {
        // Count active classes from the classes table to reflect actual registry
        Long count = classRepository.countByActiveTrue();
        return count != null ? count.intValue() : 0;
    }

    private Double calculateOverallAttendance() {
        // Calculate average attendance across all students
        Double avgAttendance = attendanceRepository.calculateOverallAttendancePercentage();
        return avgAttendance != null ? Math.round(avgAttendance * 100.0) / 100.0 : 0.0;
    }
}
