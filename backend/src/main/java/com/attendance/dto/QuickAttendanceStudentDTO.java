package com.attendance.dto;

/**
 * DTO for QuickAttendance modal - student listing
 * Maps student data with field names expected by frontend
 */
public class QuickAttendanceStudentDTO {
    
    private Long studentId;
    private String studentName;
    private String rollNumber;
    private String department;
    private int semester;
    private String section;

    public QuickAttendanceStudentDTO() {
    }

    public QuickAttendanceStudentDTO(Long studentId, String studentName, String rollNumber,
                                     String department, int semester, String section) {
        this.studentId = studentId;
        this.studentName = studentName;
        this.rollNumber = rollNumber;
        this.department = department;
        this.semester = semester;
        this.section = section;
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public String getRollNumber() {
        return rollNumber;
    }

    public void setRollNumber(String rollNumber) {
        this.rollNumber = rollNumber;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public int getSemester() {
        return semester;
    }

    public void setSemester(int semester) {
        this.semester = semester;
    }

    public String getSection() {
        return section;
    }

    public void setSection(String section) {
        this.section = section;
    }
}
