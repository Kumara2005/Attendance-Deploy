package com.attendance.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.attendance.dto.StudentDTO;
import com.attendance.dto.QuickAttendanceStudentDTO;
import com.attendance.exception.ResourceNotFoundException;
import com.attendance.model.Classes;
import com.attendance.model.Student;
import com.attendance.model.User;
import com.attendance.repository.ClassRepository;
import com.attendance.repository.StudentRepository;
import com.attendance.repository.UserRepository;

@Service
@Transactional
public class StudentService {

	private final StudentRepository repo;
	private final UserRepository userRepository;
	private final ClassRepository classRepository;
	private final PasswordEncoder passwordEncoder;

	public StudentService(StudentRepository repo, UserRepository userRepository, 
	                     ClassRepository classRepository, PasswordEncoder passwordEncoder) {
		this.repo = repo;
		this.userRepository = userRepository;
		this.classRepository = classRepository;
		this.passwordEncoder = passwordEncoder;
	}

	public Student save(Student s) {
		return repo.save(s);
	}

	public List<Student> getAll() {
		return repo.findAll();
	}

	public StudentDTO saveDTO(StudentDTO studentDTO) {
		// Normalize section: Convert numeric sections (1-8) to letter format (A-H)
		studentDTO.setSection(normalizeSection(studentDTO.getSection()));
		
		// Prevent duplicate roll numbers
		repo.findByRollNo(studentDTO.getRollNo()).ifPresent(s -> {
			throw new IllegalArgumentException("Roll number already exists");
		});

		Student student = toEntity(studentDTO);
		
		// Create User account automatically with student name as username and roll number as password
		try {
						// Check if user already exists
						if (userRepository.findByUsernameIgnoreCase(studentDTO.getName()).isPresent()) {
							throw new IllegalArgumentException("User with this name already exists");
						}
			
			User user = new User();
			user.setUsername(studentDTO.getName()); // Student name as username
			user.setPassword(passwordEncoder.encode(studentDTO.getRollNo())); // Roll number as password (hashed)
			user.setRole("ROLE_STUDENT"); // Role with ROLE_ prefix
			user.setEnabled(true);
			User savedUser = userRepository.save(user);
			
			// Link student to user
			student.setUser(savedUser);
		} catch (Exception e) {
			// If user creation fails, log but continue - student will be created without user
			System.err.println("Warning: Could not create user account for student: " + e.getMessage());
		}
		
		Student saved = repo.save(student);
		return toDTO(saved);
	}

	public List<StudentDTO> getAllDTO() {
		return repo.findAll().stream()
				.map(this::toDTO)
				.collect(Collectors.toList());
	}

	public List<StudentDTO> getByDepartmentSemesterSection(String department, Integer semester, String section) {
		System.out.println("   🔎 StudentService.getByDepartmentSemesterSection() executing:");
		System.out.println("      Query: department='" + department + "', semester=" + semester + ", section='" + section + "', active=true");
		
		List<Student> results = repo.findByDepartmentAndSemesterAndSectionAndActiveTrue(department, semester, section);
		
		System.out.println("      Result: " + results.size() + " students found");
		if (!results.isEmpty()) {
			System.out.println("      Sample: " + results.get(0).getName() + " (Dept: " + results.get(0).getDepartment() + 
							   ", Sem: " + results.get(0).getSemester() + ", Sec: " + results.get(0).getSection() + 
							   ", Active: " + results.get(0).isActive() + ")");
		}
		
		return results.stream()
				.map(this::toDTO)
				.collect(Collectors.toList());
	}

	public List<StudentDTO> getByClassId(Long classId) {
		System.out.println("   🔎 StudentService.getByClassId() executing:");
		System.out.println("      Query: classId=" + classId + ", active=true");
		
		List<Student> results = repo.findByClassEntityIdAndActiveTrue(classId);
		
		System.out.println("      Result: " + results.size() + " students found");
		if (!results.isEmpty()) {
			System.out.println("      Sample: " + results.get(0).getName() + " (ClassId: " + classId + ")");
		}
		
		return results.stream()
				.map(this::toDTO)
				.collect(Collectors.toList());
	}

	public StudentDTO getById(Long id) {
		Student student = repo.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Student", "id", id));
		return toDTO(student);
	}

	public StudentDTO update(Long id, StudentDTO studentDTO) {
		Student existing = repo.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Student", "id", id));

		// Normalize section: Convert numeric sections (1-8) to letter format (A-H)
		studentDTO.setSection(normalizeSection(studentDTO.getSection()));

		existing.setRollNo(studentDTO.getRollNo());
		existing.setName(studentDTO.getName());
		existing.setDepartment(studentDTO.getDepartment());
		existing.setSemester(studentDTO.getSemester());
		existing.setSection(studentDTO.getSection());

		Student updated = repo.save(existing);
		return toDTO(updated);
	}

	public void delete(Long id) {
		Student student = repo.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Student", "id", id));
		
		// Get the associated user before deleting student
		User associatedUser = student.getUser();
		
		// Delete the student first (due to foreign key constraint)
		repo.deleteById(id);
		
		// Then delete the associated user if it exists
		if (associatedUser != null) {
			userRepository.deleteById(associatedUser.getId());
		}
	}

	private StudentDTO toDTO(Student student) {
		StudentDTO dto = new StudentDTO();
		dto.setId(student.getId());
		dto.setRollNo(student.getRollNo());
		dto.setName(student.getName());
		dto.setDepartment(student.getDepartment());
		dto.setSemester(student.getSemester());
		dto.setEmail(student.getEmail());
		dto.setPhone(student.getPhone());
		dto.setSection(student.getSection());
		dto.setClassId(student.getClassEntity() != null ? student.getClassEntity().getId() : null);
		return dto;
	}

	private Student toEntity(StudentDTO dto) {
		Student student = new Student();
		// Don't set ID for new entities - let JPA generate it
		student.setRollNo(dto.getRollNo());
		student.setName(dto.getName());
		student.setDepartment(dto.getDepartment());
		student.setSemester(dto.getSemester());
		student.setEmail(dto.getEmail());
		student.setPhone(dto.getPhone());
		student.setSection(dto.getSection());
		
		// Set class entity if classId is provided
		if (dto.getClassId() != null) {
			Classes classEntity = classRepository.findById(dto.getClassId())
				.orElseThrow(() -> new ResourceNotFoundException("Class", "id", dto.getClassId()));
			student.setClassEntity(classEntity);
		}
		
		return student;
	}

	/**
	 * Convert Student to QuickAttendanceStudentDTO
	 * Maps field names to match frontend expectations:
	 * - name -> studentName
	 * - rollNo -> rollNumber
	 * - id -> studentId
	 */
	public QuickAttendanceStudentDTO toQuickAttendanceDTO(Student student) {
		return new QuickAttendanceStudentDTO(
			student.getId(),
			student.getName(),
			student.getRollNo(),
			student.getDepartment(),
			student.getSemester(),
			student.getSection()
		);
	}

	/**
	 * Normalize section values to letter format (A-H)
	 * Converts numeric sections (1-8) to letters (A-H)
	 * Examples: "1" -> "A", "6" -> "F", "A" -> "A"
	 */
	private String normalizeSection(String section) {
		if (section == null || section.trim().isEmpty()) {
			return "A"; // Default to section A
		}
		
		section = section.trim().toUpperCase();
		
		// If already a letter (A-H), return as-is
		if (section.matches("^[A-H]$")) {
			return section;
		}
		
		// Convert numbers 1-8 to letters A-H
		try {
			int sectionNum = Integer.parseInt(section);
			if (sectionNum >= 1 && sectionNum <= 8) {
				return String.valueOf((char) ('A' + sectionNum - 1));
			}
		} catch (NumberFormatException e) {
			// Not a number, continue
		}
		
		// If invalid format, log warning and default to A
		System.err.println("⚠️ Warning: Invalid section format '" + section + "', defaulting to 'A'");
		return "A";
	}
}
