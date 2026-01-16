package com.courseplatform.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ModuleResponseDTO {
    private UUID id;
    private String title;
    private List<LessonResponseDTO> lessons;
}