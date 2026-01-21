package com.courseplatform.backend.service;

import com.courseplatform.backend.dto.LoginDTO;
import com.courseplatform.backend.dto.LoginResponseDTO;
import com.courseplatform.backend.entity.User;
import com.courseplatform.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final TokenService tokenService;

    public LoginResponseDTO login(LoginDTO dto) {
        // Lógica do Felipe preservada: busca o usuário
        User user = repository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado!"));

        // Lógica do Felipe preservada: valida a senha
        if (!passwordEncoder.matches(dto.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Senha Incorreta!");
        }

        // Lógica do Felipe preservada: gera o token real
        String token = tokenService.generateToken(user);

        // ALTERAÇÃO: Agora passamos o ID (UUID) para o DTO
        return new LoginResponseDTO(
                token,
                user.getId(),
                user.getName(),
                user.getRole().toString()
        );
    }
}