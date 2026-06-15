package com.acp.controller;

import com.acp.dto.*;
import com.acp.service.CourseService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/courses")
public class CourseController {

    private final CourseService courseService;

    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CourseDTO>>> getAllCourses() {
        return ResponseEntity.ok(ApiResponse.success("Courses", courseService.getAllCourses()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CourseDTO>> getCourse(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Course", courseService.getCourseById(id)));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<CourseDTO>>> search(@RequestParam String keyword) {
        return ResponseEntity.ok(ApiResponse.success("Results", courseService.searchCourses(keyword)));
    }

    @PostMapping("/create")
    @PreAuthorize("hasAnyRole('ADMIN','FACULTY')")
    public ResponseEntity<ApiResponse<CourseDTO>> create(@Valid @RequestBody CourseDTO dto) {
        return ResponseEntity.ok(ApiResponse.success("Created", courseService.createCourse(dto)));
    }

    @PutMapping("/update/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','FACULTY')")
    public ResponseEntity<ApiResponse<CourseDTO>> update(@PathVariable Long id, @Valid @RequestBody CourseDTO dto) {
        return ResponseEntity.ok(ApiResponse.success("Updated", courseService.updateCourse(id, dto)));
    }

    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        courseService.deleteCourse(id);
        return ResponseEntity.ok(ApiResponse.success("Deleted", null));
    }
}