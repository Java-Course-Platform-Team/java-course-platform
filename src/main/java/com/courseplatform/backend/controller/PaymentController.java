package com.courseplatform.backend.controller;

import com.courseplatform.backend.dto.PaymentDTO; // Mudou aqui
import com.courseplatform.backend.entity.Course;
import com.courseplatform.backend.entity.User;
import com.courseplatform.backend.repository.CourseRepository;
import com.courseplatform.backend.repository.UserRepository;
import com.courseplatform.backend.service.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/payments")
public class PaymentController {

    private final PaymentService paymentService;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;

    public PaymentController(PaymentService paymentService,
                             UserRepository userRepository,
                             CourseRepository courseRepository) {
        this.paymentService = paymentService;
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
    }

    @PostMapping("/checkout")
    public ResponseEntity<Map<String, String>> checkout(@RequestBody PaymentDTO data) { // Mudou aqui

        // 1. Busca o Aluno
        User user = userRepository.findById(data.getUserId())
                .orElseThrow(() -> new RuntimeException("Aluno não encontrado"));

        // 2. Busca o Curso
        Course course = courseRepository.findById(data.getCourseId())
                .orElseThrow(() -> new RuntimeException("Curso não encontrado"));

        // 3. Cria o Link
        String paymentUrl = paymentService.createPaymentLink(course, user);

        return ResponseEntity.ok(Map.of("url", paymentUrl));
    }
}