package com.attendance.dto;

import java.time.LocalDate;
import com.attendance.model.AttendanceStatus;

/**
 * DTO for submitting attendance
 * Simpler structure to avoid deserialization issues with nested entities
 */
public class AttendanceSubmissionDTO {
    
    private Long studentId;
    private Long timetableSessionId;
    private LocalDate date;
    private AttendanceStatus status;
    
    // Additional metadata to help create session if needed
    private String subjectName;
    private String department;
    private Integer semester;
    private String section;
    
    public AttendanceSubmissionDTO() {
    }
    
    public AttendanceSubmissionDTO(Long studentId, Long timetableSessionId, LocalDate date, AttendanceStatus status) {
        this.studentId = studentId;
        this.timetableSessionId = timetableSessionId;
        this.date = date;
        this.status = status;
    }
    
    // Getters and Setters
    public Long getStudentId() {
        return studentId;
    }
    
    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }
    
    public Long getTimetableSessionId() {
        return timetableSessionId;
    }
    
    public void setTimetableSessionId(Long timetableSessionId) {
        this.timetableSessionId = timetableSessionId;
    }
    
    public LocalDate getDate() {
        return date;
    }
    
    public void setDate(LocalDate date) {
        this.date = date;
    }
    
    public AttendanceStatus getStatus() {
        return status;
    }
    
    public void setStatus(AttendanceStatus status) {
        this.status = status;
    }
    
    public String getSubjectName() {
        return subjectName;
    }
    
    public void setSubjectName(String subjectName) {
        this.subjectName = subjectName;
    }
    
    public String getDepartment() {
        return department;
    }
    
    public void setDepartment(String department) {
        this.department = department;
    }
    
    public Integer getSemester() {
        return semester;
    }
    
    public void setSemester(Integer semester) {
        this.semester = semester;
    }
    
    public String getSection() {
        return section;
    }
    
    public void setSection(String section) {
        this.section = section;
    }
    
    @Override
    public String toString() {
        return "AttendanceSubmissionDTO{" +
                "studentId=" + studentId +
                ", timetableSessionId=" + timetableSessionId +
                ", date=" + date +
                ", status=" + status +
                ", subjectName='" + subjectName + '\'' +
                ", department='" + department + '\'' +
                ", semester=" + semester +
                ", section='" + section + '\'' +
                '}';
    }
}
