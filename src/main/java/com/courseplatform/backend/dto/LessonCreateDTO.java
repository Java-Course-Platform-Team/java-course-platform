package com.courseplatform.backend.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class LessonCreateDTO {
    private String title;
    private String videoUrl; // Link do YouTube/Vimeo
    private String description;
    private UUID moduleId; // Precisamos saber a qual módulo essa aula pertence!
    private Integer durationSeconds; // Opcional: tempo da aula
}