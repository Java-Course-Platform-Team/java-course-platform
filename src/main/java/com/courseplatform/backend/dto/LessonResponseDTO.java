package com.courseplatform.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LessonResponseDTO {
    private UUID id;
    private String title;
    private String videoUrl;
    private Integer durationSeconds;
}