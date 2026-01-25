package com.courseplatform.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UserCreateDTO {

    @NotBlank(message = "O nome é obrigatório")
    @Size(min = 3, message = "O nome deve ter no mínimo 3 caracteres")
    private String name;

    @NotBlank(message = "O CPF é obrigatório")
    // Dica: Se o front mandar sem pontuação, mude min para 11. Se mandar com, mantenha 14.
    @Size(min = 11, message = "O CPF deve ser válido")
    private String cpf;

    @NotBlank(message = "O e-mail é obrigatório")
    @Email(message = "Formato de e-mail inválido")
    private String email;

    @NotBlank(message = "A senha é obrigatória")
    @Size(min = 6, message = "A senha deve ter no mínimo 6 caracteres")
    private String password;

    // REMOVIDO: private Role role; -> Segurança: Ninguém se cadastra como ADMIN sozinho.
}