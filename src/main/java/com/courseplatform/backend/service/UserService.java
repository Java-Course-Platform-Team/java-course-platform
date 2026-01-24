package com.courseplatform.backend.service;

import com.courseplatform.backend.dto.UserCreateDTO;
import com.courseplatform.backend.entity.User;
import com.courseplatform.backend.repository.UserRepository;
import com.courseplatform.backend.Role;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public User createUser(UserCreateDTO dto) {
        // Validação de e-mail duplicado
        Optional<User> existingUser = userRepository.findByEmail(dto.getEmail());
        if (existingUser.isPresent()) {
            throw new RuntimeException("E-mail já cadastrado.");
        }

        User user = new User();
        user.setName(dto.getName());
        user.setEmail(dto.getEmail());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));

        // Define papel padrão como STUDENT se não for informado
        if (dto.getRole() == null) {
            user.setRole(Role.STUDENT);
        } else {
            user.setRole(dto.getRole());
        }

        // Removida a referência ao CPF (dto.getCpf()) pois não existe no formulário de cadastro atual

        return userRepository.save(user);
    }
}