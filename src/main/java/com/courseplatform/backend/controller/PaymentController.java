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

import java.util.HashMap;
import java.util.Map;

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

        PaymentDTO paymentDTO = paymentService.createPayment(
                user,
                course.getPrice(),
                "Curso: " + course.getTitle()
        );

        return ResponseEntity.ok(paymentDTO);
    }

    // Rota corrigida para /checkout e retorno JSON para "url"
    @PostMapping("/checkout")
    public ResponseEntity<Map<String, String>> generateLink(@RequestBody PaymentRequestDTO request) {

        System.out.println("1. Recebendo pedido de checkout para curso ID: " + request.getCourseId());

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new RuntimeException("Curso não encontrado"));

        String link = paymentService.createPaymentLink(course, user);

        System.out.println("2. LINK GERADO: " + link);

        Map<String, String> response = new HashMap<>();
        response.put("url", link); // Chave "url" para o store.js entender

        return ResponseEntity.ok(response);
    }
}