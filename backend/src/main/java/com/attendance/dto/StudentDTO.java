package com.attendance.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public class StudentDTO {
    
    private Long id;
    
    @NotBlank(message = "Roll number is required")
    private String rollNo;
    
    @NotBlank(message = "Name is required")
    private String name;
    
    @NotBlank(message = "Department is required")
    private String department;
    
    @Min(value = 1, message = "Semester must be at least 1")
    private int semester;
    
    private String email;
    private String phone;
    private String section;
    private Double attendancePercentage;
    private String status;

    // Constructors
    public StudentDTO() {
    }

    public StudentDTO(Long id, String rollNo, String name, String department, 
                     int semester, String email, String phone, String section) {
        this.id = id;
        this.rollNo = rollNo;
        this.name = name;
        this.department = department;
        this.semester = semester;
        this.email = email;
        this.phone = phone;
        this.section = section;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getRollNo() {
        return rollNo;
    }

    public void setRollNo(String rollNo) {
        this.rollNo = rollNo;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
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

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getSection() {
        return section;
    }

    public void setSection(String section) {
        this.section = section;
    }

    public Double getAttendancePercentage() {
        return attendancePercentage;
    }

    public void setAttendancePercentage(Double attendancePercentage) {
        this.attendancePercentage = attendancePercentage;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
