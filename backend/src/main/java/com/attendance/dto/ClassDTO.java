package com.attendance.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class ClassDTO {
    
    private Long id;
    
    @NotBlank(message = "Class name is required")
    private String className;
    
    @NotBlank(message = "Department is required")
    private String department;
    
    @NotNull(message = "Year is required")
    @Min(value = 1, message = "Year must be at least 1")
    private int year;
    
    @NotNull(message = "Semester is required")
    @Min(value = 1, message = "Semester must be at least 1")
    private int semester;
    
    @NotBlank(message = "Section is required")
    private String section;
    
    private boolean active = true;

    // Constructors
    public ClassDTO() {}

    public ClassDTO(Long id, String className, String department, int year, int semester, String section, boolean active) {
        this.id = id;
        this.className = className;
        this.department = department;
        this.year = year;
        this.semester = semester;
        this.section = section;
        this.active = active;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getClassName() {
        return className;
    }

    public void setClassName(String className) {
        this.className = className;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public int getYear() {
        return year;
    }

    public void setYear(int year) {
        this.year = year;
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

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}
