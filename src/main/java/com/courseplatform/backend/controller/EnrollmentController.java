package com.courseplatform.backend.controller;

import com.courseplatform.backend.dto.CourseDTO;
import com.courseplatform.backend.entity.Course;
import com.courseplatform.backend.entity.Enrollment;
import com.courseplatform.backend.entity.User;
import com.courseplatform.backend.repository.CourseRepository;
import com.courseplatform.backend.repository.EnrollmentRepository;
import com.courseplatform.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/enrollments")
@RequiredArgsConstructor
public class EnrollmentController {

    private final EnrollmentRepository enrollmentRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;

    // === 1. LISTA OS CURSOS DO ALUNO (Para a tela "Minha Área") ===
    @GetMapping("/my-courses")
    public ResponseEntity<List<CourseDTO>> getMyCourses(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        List<Enrollment> enrollments = enrollmentRepository.findByUser(user);

        // Converte de Matrícula -> CursoDTO (Para o Front ler)
        List<CourseDTO> courses = enrollments.stream()
                .map(enrollment -> {
                    Course c = enrollment.getCourse();
                    // Criando DTO manual ou usando construtor se tiver
                    CourseDTO dto = new CourseDTO();
                    dto.setId(c.getId());
                    dto.setTitle(c.getTitle());
                    dto.setImageUrl(c.getImageUrl());
                    dto.setCategory(c.getCategory());
                    return dto;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(courses);
    }

    // === 2. BOTÃO MÁGICO (Matrícula Manual para Localhost) ===
    @PostMapping("/free-pass/{courseId}")
    public ResponseEntity<String> forceEnroll(@PathVariable Long courseId, Authentication authentication) {

        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Curso não encontrado"));

        // Evita duplicidade
        if (enrollmentRepository.existsByUserAndCourse(user, course)) {
            return ResponseEntity.ok("Você já possui este curso! 😅");
        }

        Enrollment enrollment = new Enrollment();
        enrollment.setUser(user);
        enrollment.setCourse(course);
        enrollment.setDate(LocalDateTime.now());

        enrollmentRepository.save(enrollment);

        return ResponseEntity.ok("Sucesso! Curso liberado manualmente. 🚀");
    }
}