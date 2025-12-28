package com.attendance.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "timetable_session")
public class TimetableSession {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "subject_id", nullable = false)
	private Subject subject;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "staff_id", nullable = false)
	private Staff staff;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "class_id")
	private Classes classEntity;

	@Column(nullable = false, length = 100)
	private String department;

	@Column(nullable = false)
	private int semester;

	@Column(length = 10)
	private String section;

	@Column(name = "day_of_week", nullable = false, length = 10)
	private String dayOfWeek;

	@Column(name = "start_time", nullable = false)
	private LocalTime startTime;

	@Column(name = "end_time", nullable = false)
	private LocalTime endTime;

	@Column(name = "room_number", length = 20)
	private String roomNumber;

	@Column(nullable = false)
	private boolean active = true;

	@Column(name = "created_at", updatable = false)
	private LocalDateTime createdAt;

	@Column(name = "updated_at")
	private LocalDateTime updatedAt;

	// Transient fields for DTO mapping
	@Transient
	private Integer periodNumber;

	@Transient
	private String subjectName;

	@Transient
	private String className;

	@Transient
	private String facultyName;

	@Transient
	private String location;

	@Transient
	private String subjectId;

	@Transient
	private String facultyId;

	@PrePersist
	protected void onCreate() {
		createdAt = LocalDateTime.now();
		updatedAt = LocalDateTime.now();
	}

	@PreUpdate
	protected void onUpdate() {
		updatedAt = LocalDateTime.now();
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Subject getSubject() {
		return subject;
	}

	public void setSubject(Subject subject) {
		this.subject = subject;
	}

	public Staff getStaff() {
		return staff;
	}

	public void setStaff(Staff staff) {
		this.staff = staff;
	}

	public Classes getClassEntity() {
		return classEntity;
	}

	public void setClassEntity(Classes classEntity) {
		this.classEntity = classEntity;
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

	public String getDayOfWeek() {
		return dayOfWeek;
	}

	public void setDayOfWeek(String dayOfWeek) {
		this.dayOfWeek = dayOfWeek;
	}

	public LocalTime getStartTime() {
		return startTime;
	}

	public void setStartTime(LocalTime startTime) {
		this.startTime = startTime;
	}

	public LocalTime getEndTime() {
		return endTime;
	}

	public void setEndTime(LocalTime endTime) {
		this.endTime = endTime;
	}

	public String getRoomNumber() {
		return roomNumber;
	}

	public void setRoomNumber(String roomNumber) {
		this.roomNumber = roomNumber;
	}

	public boolean isActive() {
		return active;
	}

	public void setActive(boolean active) {
		this.active = active;
	}

	public void setIsActive(boolean active) {
		this.active = active;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public LocalDateTime getUpdatedAt() {
		return updatedAt;
	}

	// DTO-specific getters/setters
	public Integer getPeriodNumber() {
		return periodNumber;
	}

	public void setPeriodNumber(Integer periodNumber) {
		this.periodNumber = periodNumber;
	}

	public String getSubjectName() {
		return subjectName != null ? subjectName : (subject != null ? subject.getSubjectName() : null);
	}

	public void setSubjectName(String subjectName) {
		this.subjectName = subjectName;
	}

	public String getClassName() {
		return className != null ? className : "B.Sc " + department;
	}

	public void setClassName(String className) {
		this.className = className;
	}

	public String getFacultyName() {
		return facultyName != null ? facultyName : (staff != null ? staff.getName() : null);
	}

	public void setFacultyName(String facultyName) {
		this.facultyName = facultyName;
	}

	public String getLocation() {
		return location != null ? location : roomNumber;
	}

	public void setLocation(String location) {
		this.location = location;
	}

	public String getSubjectId() {
		return subjectId != null ? subjectId : (subject != null ? subject.getSubjectCode() : null);
	}

	public void setSubjectId(String subjectId) {
		this.subjectId = subjectId;
	}

	public String getFacultyId() {
		return facultyId != null ? facultyId : (staff != null ? staff.getStaffCode() : null);
	}

	public void setFacultyId(String facultyId) {
		this.facultyId = facultyId;
	}

	public String getYear() {
		return "Year " + ((semester + 1) / 2);
	}
}