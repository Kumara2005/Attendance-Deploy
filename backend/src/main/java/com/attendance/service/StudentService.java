package com.attendance.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.attendance.dto.StudentDTO;
import com.attendance.exception.ResourceNotFoundException;
import com.attendance.model.Student;
import com.attendance.repository.StudentRepository;

@Service
@Transactional
public class StudentService {

	private final StudentRepository repo;

	public StudentService(StudentRepository repo) {
		this.repo = repo;
	}

	public Student save(Student s) {
		return repo.save(s);
	}

	public List<Student> getAll() {
		return repo.findAll();
	}

	public StudentDTO saveDTO(StudentDTO studentDTO) {
		Student student = toEntity(studentDTO);
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
		if (!repo.existsById(id)) {
			throw new ResourceNotFoundException("Student", "id", id);
		}
		repo.deleteById(id);
	}

	private StudentDTO toDTO(Student student) {
		StudentDTO dto = new StudentDTO();
		dto.setId(student.getId());
		dto.setRollNo(student.getRollNo());
		dto.setName(student.getName());
		dto.setDepartment(student.getDepartment());
		dto.setSemester(student.getSemester());
		return dto;
	}

	private Student toEntity(StudentDTO dto) {
		Student student = new Student();
		// Don't set ID for new entities - let JPA generate it
		student.setRollNo(dto.getRollNo());
		student.setName(dto.getName());
		student.setDepartment(dto.getDepartment());
		student.setSemester(dto.getSemester());
		return student;
	}
}
