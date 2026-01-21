package com.courseplatform.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.UUID;

@Data
@AllArgsConstructor
public class LoginResponseDTO {
    private String token;
    private UUID id;    // O identificador único do Dr. para compras e progresso
    private String name;
    private String role;
}