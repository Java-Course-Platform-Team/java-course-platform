package com.courseplatform.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.util.UUID;
import java.time.LocalDateTime;

@Data // Faz os Getters e Setters sozinhos
@Entity // Fala pro Java que isso é uma tabela
@Table(name = "tb_modules")
public class Module {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID) // O ID é UUID automático
    private UUID id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "\"order\"") // "order" é palavra reservada do banco, então usamos aspas
    private Integer order;

    // A Mágica do Relacionamento: Muitos Módulos -> Um Curso
    @ManyToOne
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    private LocalDateTime createdAt = LocalDateTime.now();
}