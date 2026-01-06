package com.courseplatform.backend.dto;

import lombok.Data;

@Data
public class ModuleCreateDTO {
    private String title;
    private String description;
    private Long courseId; // Precisamos saber a qual curso esse módulo pertence!
}