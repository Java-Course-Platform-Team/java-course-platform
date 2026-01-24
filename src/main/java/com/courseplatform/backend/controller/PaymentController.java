package com.courseplatform.backend.controller;

import com.courseplatform.backend.dto.PaymentDTO;
import com.courseplatform.backend.dto.PaymentRequestDTO;
import com.courseplatform.backend.entity.Course;
import com.courseplatform.backend.entity.User;
import com.courseplatform.backend.repository.CourseRepository;
import com.courseplatform.backend.repository.UserRepository;
import com.courseplatform.backend.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/payments")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CourseRepository courseRepository;

    @PostMapping("/pix")
    public ResponseEntity<PaymentDTO> generatePix(@RequestBody PaymentRequestDTO request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new RuntimeException("Curso não encontrado"));

        // Gera o PIX usando o serviço
        PaymentDTO paymentDTO = paymentService.createPayment(
                user,
                course.getPrice(),
                "Curso: " + course.getTitle()
        );

        return ResponseEntity.ok(paymentDTO);
    }

    @PostMapping("/link")
    public ResponseEntity<String> generateLink(@RequestBody PaymentRequestDTO request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new RuntimeException("Curso não encontrado"));

        // Gera o link de checkout usando o serviço
        String link = paymentService.createPaymentLink(course, user);

        return ResponseEntity.ok(link);
    }
}