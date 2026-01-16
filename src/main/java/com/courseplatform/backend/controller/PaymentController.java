package com.courseplatform.backend.controller;

import com.courseplatform.backend.dto.PaymentDTO;
import com.courseplatform.backend.entity.Course;
import com.courseplatform.backend.entity.User;
import com.courseplatform.backend.repository.CourseRepository;
import com.courseplatform.backend.repository.UserRepository;
import com.courseplatform.backend.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;

    @PostMapping("/checkout")
    public ResponseEntity<Map<String, String>> checkout(@RequestBody PaymentDTO dto, Authentication authentication) {

        System.out.println("💰 Pedido de Checkout recebido!");

        // 1. Acha o Usuário (Tenta pelo ID do JSON, se não der, pega do Token)
        User user;
        if (dto.getUserId() != null) {
            user = userRepository.findById(dto.getUserId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado"));
        } else {
            String email = authentication.getName();
            user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário do token não encontrado"));
        }

        // 2. Acha o Curso
        Course course = courseRepository.findById(dto.getCourseId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Curso não encontrado"));

        System.out.println("🛒 Comprando: " + course.getTitle() + " | Cliente: " + user.getName());

        // 3. Gera o Link no Mercado Pago
        String paymentUrl = paymentService.createPaymentLink(course, user);

        // 4. Devolve o Link para o Frontend
        return ResponseEntity.ok(Map.of("url", paymentUrl));
    }
}