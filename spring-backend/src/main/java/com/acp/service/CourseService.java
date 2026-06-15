package com.acp.service;

import com.acp.dto.*;
import com.acp.entity.*;
import com.acp.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CourseService {

    private final CourseRepository courseRepository;
    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;

    public CourseService(CourseRepository courseRepository,
                         DepartmentRepository departmentRepository,
                         UserRepository userRepository,
                         EnrollmentRepository enrollmentRepository) {
        this.courseRepository = courseRepository;
        this.departmentRepository = departmentRepository;
        this.userRepository = userRepository;
        this.enrollmentRepository = enrollmentRepository;
    }

    public List<CourseDTO> getAllCourses() {
        return courseRepository.findAll().stream()
            .map(this::toDTO).collect(Collectors.toList());
    }

    public CourseDTO getCourseById(Long id) {
        return courseRepository.findById(id)
            .map(this::toDTO)
            .orElseThrow(() -> new RuntimeException("Course not found: " + id));
    }

    public List<CourseDTO> searchCourses(String keyword) {
        return courseRepository.searchCourses(keyword).stream()
            .map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional
    public CourseDTO createCourse(CourseDTO dto) {
        if (courseRepository.existsByCode(dto.getCode()))
            throw new RuntimeException("Course code already exists: " + dto.getCode());

        Department dept = departmentRepository.findById(dto.getDepartmentId())
            .orElseThrow(() -> new RuntimeException("Department not found"));

        Course course = new Course();
        course.setTitle(dto.getTitle());
        course.setCode(dto.getCode());
        course.setDescription(dto.getDescription());
        course.setCredits(dto.getCredits());
        course.setMaxStudents(dto.getMaxStudents());
        course.setDepartment(dept);
        course.setSemester(dto.getSemester());
        course.setAcademicYear(dto.getAcademicYear());
        course.setSchedule(dto.getSchedule());
        course.setRoom(dto.getRoom());
        course.setStatus(dto.getStatus() != null ? dto.getStatus() : "ACTIVE");

        if (dto.getFacultyId() != null) {
            userRepository.findById(dto.getFacultyId()).ifPresent(course::setFaculty);
        }

        return toDTO(courseRepository.save(course));
    }

    @Transactional
    public CourseDTO updateCourse(Long id, CourseDTO dto) {
        Course course = courseRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Course not found: " + id));

        course.setTitle(dto.getTitle());
        course.setDescription(dto.getDescription());
        course.setCredits(dto.getCredits());
        course.setMaxStudents(dto.getMaxStudents());
        course.setSemester(dto.getSemester());
        course.setAcademicYear(dto.getAcademicYear());
        course.setSchedule(dto.getSchedule());
        course.setRoom(dto.getRoom());
        if (dto.getStatus() != null) course.setStatus(dto.getStatus());
        course.setUpdatedAt(LocalDateTime.now());

        if (dto.getFacultyId() != null) {
            userRepository.findById(dto.getFacultyId()).ifPresent(course::setFaculty);
        }
        if (dto.getDepartmentId() != null) {
            departmentRepository.findById(dto.getDepartmentId()).ifPresent(course::setDepartment);
        }

        return toDTO(courseRepository.save(course));
    }

    @Transactional
    public void deleteCourse(Long id) {
        if (!courseRepository.existsById(id))
            throw new RuntimeException("Course not found: " + id);
        courseRepository.deleteById(id);
    }

    public List<CourseDTO> getCoursesByDepartment(Long deptId) {
        return courseRepository.findByDepartmentId(deptId).stream()
            .map(this::toDTO).collect(Collectors.toList());
    }

    public List<CourseDTO> getCoursesByFaculty(Long facultyId) {
        return courseRepository.findByFacultyId(facultyId).stream()
            .map(this::toDTO).collect(Collectors.toList());
    }

    private CourseDTO toDTO(Course c) {
        CourseDTO dto = new CourseDTO();
        dto.setId(c.getId());
        dto.setTitle(c.getTitle());
        dto.setCode(c.getCode());
        dto.setDescription(c.getDescription());
        dto.setCredits(c.getCredits());
        dto.setMaxStudents(c.getMaxStudents());
        dto.setDepartmentId(c.getDepartment() != null ? c.getDepartment().getId() : null);
        dto.setFacultyId(c.getFaculty() != null ? c.getFaculty().getId() : null);
        dto.setSemester(c.getSemester());
        dto.setAcademicYear(c.getAcademicYear());
        dto.setSchedule(c.getSchedule());
        dto.setRoom(c.getRoom());
        dto.setStatus(c.getStatus());
        dto.setEnrolledCount(enrollmentRepository.countByCourseIdAndStatus(c.getId()));
        return dto;
    }
}