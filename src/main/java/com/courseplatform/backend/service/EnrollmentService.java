package com.courseplatform.backend.service;

import com.courseplatform.backend.entity.Enrollment;
import com.courseplatform.backend.entity.User;
import com.courseplatform.backend.entity.Course;
import com.courseplatform.backend.repository.EnrollmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class EnrollmentService {

    private final EnrollmentRepository repository;

    // Método para liberar o acesso (Vamos chamar isso quando o Webhook funcionar)
    public void enrollStudent(User user, Course course) {
        // 1. Verifica se já não tem matrícula
        if (repository.existsByUserAndCourse(user, course)) {
            System.out.println(" Usuário já matriculado neste curso.");
            return;
        }

        // 2. Cria a matrícula
        Enrollment enrollment = Enrollment.builder()
                .user(user)
                .course(course)
                .enrolledAt(LocalDateTime.now())
                .build();

        repository.save(enrollment);
        System.out.println(" Matrícula criada com sucesso para: " + user.getName());
    }
}