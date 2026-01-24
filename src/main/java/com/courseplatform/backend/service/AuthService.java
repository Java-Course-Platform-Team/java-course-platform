package com.courseplatform.backend.service;

import com.courseplatform.backend.entity.User;
import com.courseplatform.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public User authenticate(String login, String password) {
        // Tenta buscar por e-mail, se não achar, tenta por CPF
        User user = userRepository.findByEmail(login)
                .orElseGet(() -> userRepository.findByCpf(login)
                        .orElseThrow(() -> new RuntimeException("Usuário não encontrado")));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Senha inválida");
        }
        return user;
    }
}