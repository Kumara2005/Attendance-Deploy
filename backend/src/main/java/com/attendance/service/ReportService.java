package com.attendance.service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.attendance.dto.AttendanceReportDTO;
import com.attendance.model.SessionAttendance;
import com.attendance.model.Student;
import com.attendance.model.AttendanceStatus;
import com.attendance.repository.SessionAttendanceRepository;
import com.attendance.repository.StudentRepository;

@Service
public class ReportService {

    private final SessionAttendanceRepository attendanceRepository;
    private final StudentRepository studentRepository;

    public ReportService(SessionAttendanceRepository attendanceRepository, 
                        StudentRepository studentRepository) {
        this.attendanceRepository = attendanceRepository;
        this.studentRepository = studentRepository;
    }

    /**
     * Generate daily attendance report for all students or specific department
     */
    public List<AttendanceReportDTO> getDailyReport(LocalDate date, String department, Integer year) {
        List<SessionAttendance> attendances = attendanceRepository.findByDate(date);
        
        // Group by student
        Map<Long, List<SessionAttendance>> groupedByStudent = attendances.stream()
            .collect(Collectors.groupingBy(a -> a.getStudent().getId()));
        
        List<AttendanceReportDTO> reports = new ArrayList<>();
        
        for (Map.Entry<Long, List<SessionAttendance>> entry : groupedByStudent.entrySet()) {
            Student student = entry.getValue().get(0).getStudent();
            
            // Apply filters
            if (department != null && !department.isEmpty() && 
                !student.getDepartment().equalsIgnoreCase(department)) {
                continue;
            }
            
            if (year != null) {
                int studentYear = (student.getSemester() + 1) / 2;
                if (studentYear != year) {
                    continue;
                }
            }
            
            List<SessionAttendance> studentAttendances = entry.getValue();
            long total = studentAttendances.size();
            long present = studentAttendances.stream()
                .filter(a -> a.getStatus() == AttendanceStatus.PRESENT || 
                           a.getStatus() == AttendanceStatus.OD)
                .count();
            
            double percentage = total > 0 ? (present * 100.0 / total) : 0.0;
            
            reports.add(new AttendanceReportDTO(
                student.getId(),
                student.getName(),
                student.getRollNo(),
                student.getDepartment(),
                student.getSemester(),
                student.getSection(),
                total,
                present,
                Math.round(percentage * 100.0) / 100.0
            ));
        }
        
        return reports;
    }

    /**
     * Generate periodic (date range) attendance report
     */
    public List<AttendanceReportDTO> getPeriodicReport(LocalDate fromDate, LocalDate toDate, 
                                                       String department, Integer year) {
        List<SessionAttendance> attendances = attendanceRepository.findByDateBetween(fromDate, toDate);
        
        // Group by student
        Map<Long, List<SessionAttendance>> groupedByStudent = attendances.stream()
            .collect(Collectors.groupingBy(a -> a.getStudent().getId()));
        
        List<AttendanceReportDTO> reports = new ArrayList<>();
        
        for (Map.Entry<Long, List<SessionAttendance>> entry : groupedByStudent.entrySet()) {
            Student student = entry.getValue().get(0).getStudent();
            
            // Apply filters
            if (department != null && !department.isEmpty() && 
                !student.getDepartment().equalsIgnoreCase(department)) {
                continue;
            }
            
            if (year != null) {
                int studentYear = (student.getSemester() + 1) / 2;
                if (studentYear != year) {
                    continue;
                }
            }
            
            List<SessionAttendance> studentAttendances = entry.getValue();
            long total = studentAttendances.size();
            long present = studentAttendances.stream()
                .filter(a -> a.getStatus() == AttendanceStatus.PRESENT || 
                           a.getStatus() == AttendanceStatus.OD)
                .count();
            
            double percentage = total > 0 ? (present * 100.0 / total) : 0.0;
            
            reports.add(new AttendanceReportDTO(
                student.getId(),
                student.getName(),
                student.getRollNo(),
                student.getDepartment(),
                student.getSemester(),
                student.getSection(),
                total,
                present,
                Math.round(percentage * 100.0) / 100.0
            ));
        }
        
        return reports;
    }

    /**
     * Generate semester-wise attendance report for all students
     */
    public List<AttendanceReportDTO> getSemesterReport(String department, Integer year, Integer semester) {
        List<Student> students;
        
        if (department != null && !department.isEmpty() && semester != null) {
            students = studentRepository.findByDepartmentAndSemester(department, semester);
        } else if (department != null && !department.isEmpty()) {
            students = studentRepository.findAll().stream()
                .filter(s -> s.getDepartment().equalsIgnoreCase(department))
                .collect(Collectors.toList());
        } else {
            students = studentRepository.findAll();
        }
        
        // Apply year filter
        if (year != null) {
            students = students.stream()
                .filter(s -> {
                    int studentYear = (s.getSemester() + 1) / 2;
                    return studentYear == year;
                })
                .collect(Collectors.toList());
        }
        
        List<AttendanceReportDTO> reports = new ArrayList<>();
        
        for (Student student : students) {
            List<SessionAttendance> attendances = attendanceRepository.findByStudentId(student.getId());
            
            long total = attendances.size();
            long present = attendances.stream()
                .filter(a -> a.getStatus() == AttendanceStatus.PRESENT || 
                           a.getStatus() == AttendanceStatus.OD)
                .count();
            
            double percentage = total > 0 ? (present * 100.0 / total) : 0.0;
            
            reports.add(new AttendanceReportDTO(
                student.getId(),
                student.getName(),
                student.getRollNo(),
                student.getDepartment(),
                student.getSemester(),
                student.getSection(),
                total,
                present,
                Math.round(percentage * 100.0) / 100.0
            ));
        }
        
        return reports;
    }

    /**
     * Generate attendance report for a specific student by roll number
     */
    public AttendanceReportDTO getStudentReport(String rollNumber, LocalDate fromDate, LocalDate toDate) {
        Optional<Student> studentOpt = studentRepository.findByRollNo(rollNumber);
        
        if (studentOpt.isEmpty()) {
            return null;
        }
        
        Student student = studentOpt.get();
        List<SessionAttendance> attendances;
        
        if (fromDate != null && toDate != null) {
            attendances = attendanceRepository.findByDateBetween(fromDate, toDate).stream()
                .filter(a -> a.getStudent().getId().equals(student.getId()))
                .collect(Collectors.toList());
        } else {
            attendances = attendanceRepository.findByStudentId(student.getId());
        }
        
        long total = attendances.size();
        long present = attendances.stream()
            .filter(a -> a.getStatus() == AttendanceStatus.PRESENT || 
                       a.getStatus() == AttendanceStatus.OD)
            .count();
        
        double percentage = total > 0 ? (present * 100.0 / total) : 0.0;
        
        return new AttendanceReportDTO(
            student.getId(),
            student.getName(),
            student.getRollNo(),
            student.getDepartment(),
            student.getSemester(),
            student.getSection(),
            total,
            present,
            Math.round(percentage * 100.0) / 100.0
        );
    }
}
