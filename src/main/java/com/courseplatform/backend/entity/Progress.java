package com.courseplatform.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "tb_progress", uniqueConstraints = {
        // Garante que o usuário não conclua a mesma aula 2 vezes
        @UniqueConstraint(columnNames = {"user_id", "lesson_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Progress {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // --- CORREÇÃO AQUI ---
    // Antes era apenas UUID lessonId (solto).
    // Agora é um relacionamento real. Se tentar apagar a aula, o banco avisa.
    @ManyToOne
    @JoinColumn(name = "lesson_id", nullable = false)
    private Lesson lesson;
    // ---------------------

    @Column(name = "completed_at")
    private LocalDateTime completedAt = LocalDateTime.now();
}