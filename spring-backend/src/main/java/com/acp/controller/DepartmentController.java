package com.acp.controller;

import com.acp.dto.ApiResponse;
import com.acp.entity.Department;
import com.acp.repository.DepartmentRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/departments")
public class DepartmentController {

    private final DepartmentRepository departmentRepository;

    public DepartmentController(DepartmentRepository departmentRepository) {
        this.departmentRepository = departmentRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Department>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success("Departments", departmentRepository.findAll()));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Department>> create(@RequestBody Map<String, String> body) {
        Department dept = new Department();
        dept.setName(body.get("name"));
        dept.setCode(body.get("code") != null ? body.get("code").toUpperCase() : "DEPT");
        dept.setDescription(body.get("description"));
        return ResponseEntity.ok(ApiResponse.success("Created", departmentRepository.save(dept)));
    }
}