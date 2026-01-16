package com.courseplatform.backend.controller;

import com.courseplatform.backend.dto.DashboardStatsDTO;
import com.courseplatform.backend.repository.CourseRepository;
import com.courseplatform.backend.repository.EnrollmentRepository;
import com.courseplatform.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;

@RestController
@RequestMapping("/admin/dashboard")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsDTO> getStats() {
        BigDecimal revenue = enrollmentRepository.calculateTotalRevenue();
        if (revenue == null) revenue = BigDecimal.ZERO;

        return ResponseEntity.ok(DashboardStatsDTO.builder()
                .totalStudents(userRepository.count())
                .totalCourses(courseRepository.count())
                .totalEnrollments(enrollmentRepository.count())
                .totalRevenue(revenue)
                .build());
    }
}