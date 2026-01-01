package com.attendance.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.attendance.dto.StudentDTO;
import com.attendance.exception.ResourceNotFoundException;
import com.attendance.model.Student;
import com.attendance.model.User;
import com.attendance.repository.StudentRepository;
import com.attendance.repository.UserRepository;

@Service
@Transactional
public class StudentService {

	private final StudentRepository repo;
	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;

	public StudentService(StudentRepository repo, UserRepository userRepository, PasswordEncoder passwordEncoder) {
		this.repo = repo;
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
	}

	public Student save(Student s) {
		return repo.save(s);
	}

	public List<Student> getAll() {
		return repo.findAll();
	}

	public StudentDTO saveDTO(StudentDTO studentDTO) {
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

	public StudentDTO getById(Long id) {
		Student student = repo.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Student", "id", id));
		return toDTO(student);
	}

	public StudentDTO update(Long id, StudentDTO studentDTO) {
		Student existing = repo.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Student", "id", id));

		existing.setRollNo(studentDTO.getRollNo());
		existing.setName(studentDTO.getName());
		existing.setDepartment(studentDTO.getDepartment());
		existing.setSemester(studentDTO.getSemester());

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
		return student;
	}
}
