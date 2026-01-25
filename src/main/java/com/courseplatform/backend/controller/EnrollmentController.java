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
import org.springframework.security.access.prepost.PreAuthorize; // <--- IMPORT NOVO
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
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
                    CourseDTO dto = new CourseDTO();
                    dto.setId(c.getId());
                    dto.setTitle(c.getTitle());
                    dto.setImageUrl(c.getImageUrl());
                    dto.setCategory(c.getCategory());
                    // Adicione mais campos aqui se precisar (slug, description, etc)
                    return dto;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(courses);
    }

    // === 2. BOTÃO MÁGICO (AGORA BLINDADO PARA ADMIN) ===
    @PostMapping("/free-pass/{courseId}")
    @PreAuthorize("hasRole('ADMIN')") // <--- TRAVA DE SEGURANÇA APLICADA 🔒
    public ResponseEntity<String> forceEnroll(@PathVariable UUID courseId, Authentication authentication) {

        String email = authentication.getName(); // Quem está fazendo o pedido (O Admin)

        // Aqui você pode mudar a lógica: O Admin libera para SI MESMO ou para OUTRO?
        // Do jeito que está abaixo, o Admin libera para ele mesmo testar.
        // Se quiser liberar para outro, teria que receber o email do aluno no @RequestBody.

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Curso não encontrado"));

        if (enrollmentRepository.existsByUserAndCourse(user, course)) {
            return ResponseEntity.ok("Este usuário já possui o curso! 😅");
        }

        Enrollment enrollment = new Enrollment();
        enrollment.setUser(user);
        enrollment.setCourse(course);
        enrollment.setEnrolledAt(LocalDateTime.now()); // Data correta

        enrollmentRepository.save(enrollment);

        return ResponseEntity.ok("Sucesso! Curso liberado manualmente pelo Admin. 🚀");
    }
}