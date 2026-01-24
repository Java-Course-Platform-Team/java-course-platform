package com.courseplatform.backend.service;

import com.courseplatform.backend.dto.UserCreateDTO;
import com.courseplatform.backend.entity.User;
import com.courseplatform.backend.repository.UserRepository;
import com.courseplatform.backend.Role;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // Criação de usuário (Usado por AuthController e UserController)
    public User createUser(UserCreateDTO dto) {
        Optional<User> existingUser = userRepository.findByEmail(dto.getEmail());
        if (existingUser.isPresent()) {
            throw new RuntimeException("E-mail já cadastrado.");
        }

        User user = new User();
        user.setName(dto.getName());
        user.setCpf(dto.getCpf());
        user.setEmail(dto.getEmail());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));

        if (dto.getRole() == null) {
            user.setRole(Role.STUDENT);
        } else {
            user.setRole(dto.getRole());
        }

        return userRepository.save(user);
    }

    // Listar todos os usuários
    public List<User> listAllUsers() {
        return userRepository.findAll();
    }

    // Deletar usuário
    public void deleteUser(UUID id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("Usuário não encontrado.");
        }
        userRepository.deleteById(id);
    }

    // Atualizar usuário (Nome e Role)
    public User updateUser(UUID id, User userUpdates) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado."));

        if (userUpdates.getName() != null) user.setName(userUpdates.getName());
        if (userUpdates.getRole() != null) user.setRole(userUpdates.getRole());
        if (userUpdates.getEmail() != null) user.setEmail(userUpdates.getEmail());

        return userRepository.save(user);
    }

    // Resetar Senha (define uma senha padrão temporária)
    public void resetPassword(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado."));

        // Define senha padrão: "123456" (Em produção, envie por e-mail)
        user.setPassword(passwordEncoder.encode("123456"));
        userRepository.save(user);
    }
}