// ============================================================
// FILE: repository/CourseRepository.java
// ============================================================
package com.acp.repository;

import com.acp.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface CourseRepository extends JpaRepository<Course, Long> {
    Optional<Course> findByCode(String code);
    boolean existsByCode(String code);
    List<Course> findByStatus(String status);
    List<Course> findByDepartmentId(Long departmentId);
    List<Course> findByFacultyId(Long facultyId);
    List<Course> findBySemesterAndAcademicYear(String semester, String year);

    @Query("SELECT c FROM Course c WHERE " +
           "LOWER(c.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(c.code) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Course> searchCourses(@Param("keyword") String keyword);

    @Query("SELECT COUNT(e) FROM Enrollment e WHERE e.course.id = :courseId AND e.status = 'ENROLLED'")
    long countEnrolledStudents(@Param("courseId") Long courseId);
}
