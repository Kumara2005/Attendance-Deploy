package com.attendance.service;

import com.attendance.dto.ClassDTO;
import com.attendance.model.Classes;
import com.attendance.repository.ClassRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ClassService {

    @Autowired
    private ClassRepository classRepository;

    // Get all classes
    public List<ClassDTO> getAllClasses() {
        return classRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Get class by ID
    public Optional<ClassDTO> getClassById(Long id) {
        return classRepository.findById(id)
                .map(this::convertToDTO);
    }

    // Get classes by department
    public List<ClassDTO> getClassesByDepartment(String department) {
        return classRepository.findByDepartment(department)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Get classes by department and year
    public List<ClassDTO> getClassesByDepartmentAndYear(String department, int year) {
        return classRepository.findByDepartmentAndYear(department, year)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Create new class
    public ClassDTO createClass(ClassDTO classDTO) {
        Classes classEntity = new Classes();
        classEntity.setClassName(classDTO.getClassName());
        classEntity.setDepartment(classDTO.getDepartment());
        classEntity.setYear(classDTO.getYear());
        classEntity.setSemester(classDTO.getSemester());
        classEntity.setSection(classDTO.getSection());
        classEntity.setActive(classDTO.isActive());

        Classes savedClass = classRepository.save(classEntity);
        return convertToDTO(savedClass);
    }

    // Update existing class
    public Optional<ClassDTO> updateClass(Long id, ClassDTO classDTO) {
        return classRepository.findById(id).map(classEntity -> {
            classEntity.setClassName(classDTO.getClassName());
            classEntity.setDepartment(classDTO.getDepartment());
            classEntity.setYear(classDTO.getYear());
            classEntity.setSemester(classDTO.getSemester());
            classEntity.setSection(classDTO.getSection());
            classEntity.setActive(classDTO.isActive());

            Classes updatedClass = classRepository.save(classEntity);
            return convertToDTO(updatedClass);
        });
    }

    // Delete class
    public boolean deleteClass(Long id) {
        if (classRepository.existsById(id)) {
            classRepository.deleteById(id);
            return true;
        }
        return false;
    }

    // Check if class exists with same department, year, semester, and section
    public boolean classExists(String department, int year, int semester, String section) {
        return classRepository.findByDepartmentAndYearAndSemesterAndSection(department, year, semester, section)
                .isPresent();
    }

    // Convert Classes entity to ClassDTO
    private ClassDTO convertToDTO(Classes classEntity) {
        return new ClassDTO(
                classEntity.getId(),
                classEntity.getClassName(),
                classEntity.getDepartment(),
                classEntity.getYear(),
                classEntity.getSemester(),
                classEntity.getSection(),
                classEntity.isActive()
        );
    }

    // Convert ClassDTO to Classes entity
    private Classes convertToEntity(ClassDTO classDTO) {
        Classes classEntity = new Classes();
        classEntity.setId(classDTO.getId());
        classEntity.setClassName(classDTO.getClassName());
        classEntity.setDepartment(classDTO.getDepartment());
        classEntity.setYear(classDTO.getYear());
        classEntity.setSemester(classDTO.getSemester());
        classEntity.setSection(classDTO.getSection());
        classEntity.setActive(classDTO.isActive());
        return classEntity;
    }
}
