package com.courseplatform.backend.dto;

import lombok.Data;

import java.util.UUID;

@Data
public class ModuleCreateDTO {
    private String title;
    private String description;
    private UUID courseId;
}