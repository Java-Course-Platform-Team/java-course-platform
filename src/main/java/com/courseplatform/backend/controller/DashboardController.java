package com.courseplatform.backend.controller;

import com.courseplatform.backend.repository.CourseRepository;
import com.courseplatform.backend.repository.EnrollmentRepository;
import com.courseplatform.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/stats") // Endpoint: /stats
public class DashboardController {

    @Autowired private UserRepository userRepository;
    @Autowired private CourseRepository courseRepository;
    @Autowired private EnrollmentRepository enrollmentRepository;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        // 1. Total de Alunos
        long totalStudents = userRepository.count();

        // 2. Cursos Ativos
        long totalCourses = courseRepository.count();

        // 3. Faturamento (Total de matrículas * Preço médio ou somatória real)
        // Aqui vamos simplificar e contar matrículas. Se quiser somar valor, precisaria de uma query.
        long totalEnrollments = enrollmentRepository.count();
        double estimatedRevenue = totalEnrollments * 2500.00; // Mock: R$ 2500 por curso vendido

        Map<String, Object> stats = new HashMap<>();
        stats.put("students", totalStudents);
        stats.put("courses", totalCourses);
        stats.put("revenue", estimatedRevenue);

        return ResponseEntity.ok(stats);
    }
}