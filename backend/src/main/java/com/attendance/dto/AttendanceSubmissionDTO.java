package com.attendance.dto;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import com.attendance.model.AttendanceStatus;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonIgnore;

/**
 * DTO for submitting attendance
 * Simpler structure to avoid deserialization issues with nested entities
 */
public class AttendanceSubmissionDTO {
    
    private Long studentId;
    private Long timetableSessionId;
    
    // Accept date as string (ISO format YYYY-MM-DD) from frontend
    @JsonProperty("date")
    private String dateString;
    
    private AttendanceStatus status;
    
    // Additional metadata to help create session if needed
    private String subjectName;
    private String department;
    private Integer semester;
    private String section;
    
    public AttendanceSubmissionDTO() {
    }
    
    public AttendanceSubmissionDTO(Long studentId, Long timetableSessionId, String dateString, AttendanceStatus status) {
        this.studentId = studentId;
        this.timetableSessionId = timetableSessionId;
        this.dateString = dateString;
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
    
    public String getDateString() {
        return dateString;
    }
    
    public void setDateString(String dateString) {
        this.dateString = dateString;
    }
    
    /**
     * Parse the date string to LocalDate
     * This method is for internal use only, not for JSON deserialization
     */
    @JsonIgnore
    public LocalDate getDate() {
        if (dateString == null) {
            return LocalDate.now();
        }
        try {
            return LocalDate.parse(dateString, DateTimeFormatter.ISO_DATE);
        } catch (Exception e) {
            System.err.println("❌ Failed to parse date: " + dateString);
            return LocalDate.now();
        }
    }
    
    @JsonIgnore
    public void setDate(LocalDate date) {
        this.dateString = date != null ? date.toString() : null;
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
                ", dateString='" + dateString + '\'' +
                ", status=" + status +
                ", subjectName='" + subjectName + '\'' +
                ", department='" + department + '\'' +
                ", semester=" + semester +
                ", section='" + section + '\'' +
                '}';
    }
}
