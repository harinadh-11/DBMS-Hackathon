package com.acp.controller;

import com.acp.dto.ApiResponse;
import com.acp.entity.Enrollment;
import com.acp.service.EnrollmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/enrollments")
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    public EnrollmentController(EnrollmentService enrollmentService) {
        this.enrollmentService = enrollmentService;
    }

    @PostMapping("/enroll")
    public ResponseEntity<ApiResponse<Enrollment>> enroll(@RequestBody Map<String, Long> body) {
        return ResponseEntity.ok(ApiResponse.success("Enrolled",
            enrollmentService.enroll(body.get("studentId"), body.get("courseId"))));
    }

    @PutMapping("/drop")
    public ResponseEntity<ApiResponse<Enrollment>> drop(@RequestBody Map<String, Long> body) {
        return ResponseEntity.ok(ApiResponse.success("Dropped",
            enrollmentService.dropCourse(body.get("studentId"), body.get("courseId"))));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<ApiResponse<List<Enrollment>>> studentEnrollments(@PathVariable Long studentId) {
        return ResponseEntity.ok(ApiResponse.success("Enrollments",
            enrollmentService.getStudentEnrollments(studentId)));
    }

    @GetMapping("/course/{courseId}")
    @PreAuthorize("hasAnyRole('ADMIN','FACULTY')")
    public ResponseEntity<ApiResponse<List<Enrollment>>> courseEnrollments(@PathVariable Long courseId) {
        return ResponseEntity.ok(ApiResponse.success("Enrollments",
            enrollmentService.getCourseEnrollments(courseId)));
    }

    @PutMapping("/{id}/grade")
    @PreAuthorize("hasAnyRole('ADMIN','FACULTY')")
    public ResponseEntity<ApiResponse<Enrollment>> grade(@PathVariable Long id,
                                                          @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(ApiResponse.success("Grade updated",
            enrollmentService.updateGrade(id, body.get("grade"))));
    }
}