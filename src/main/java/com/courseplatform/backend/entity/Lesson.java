package com.courseplatform.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.util.UUID;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "tb_lessons")
public class Lesson {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String videoUrl; // Link do vídeo (YouTube/Vimeo)

    @Column(columnDefinition = "TEXT")
    private String description;

    private Integer durationSeconds; // Duração em segundos

    @Column(name = "\"order\"")
    private Integer order;

    private Boolean isFree = false; // Se é aula grátis de demonstração

    // A Mágica: Muitas Aulas -> Um Módulo
    @ManyToOne
    @JoinColumn(name = "module_id", nullable = false)
    private Module module;

    private LocalDateTime createdAt = LocalDateTime.now();
}