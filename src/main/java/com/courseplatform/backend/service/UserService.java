package com.courseplatform.backend.service;

import com.courseplatform.backend.Role;
import com.courseplatform.backend.dto.UserCreateDTO;
import com.courseplatform.backend.entity.User;
import com.courseplatform.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;

    public User registerUser(UserCreateDTO dto) {
        if (repository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Erro: Email já cadastrado!");
        }
        User newUser = new User();
        newUser.setName(dto.getName());
        newUser.setEmail(dto.getEmail());
        newUser.setCpf(dto.getCpf());
        newUser.setPasswordHash(passwordEncoder.encode(dto.getPassword()));
        newUser.setRole(Role.STUDENT);
        return repository.save(newUser);
    }

    public List<User> listAllUsers() {
        return repository.findAll();
    }

    // 1. EXCLUIR USUÁRIO (Real)
    @Transactional
    public void deleteUser(UUID id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Usuário não encontrado.");
        }
        // Nota: Garanta que Enrollment e Progress tenham CascadeType.REMOVE ou remova-os manualmente aqui
        repository.deleteById(id);
    }

    // 2. ATUALIZAR DADOS
    public User updateUser(UUID id, User data) {
        User user = repository.findById(id).orElseThrow(() -> new RuntimeException("Usuário não encontrado."));
        user.setName(data.getName());
        user.setEmail(data.getEmail());
        user.setCpf(data.getCpf());
        return repository.save(user);
    }

    // 3. RESETAR SENHA (Padrão: odonto123)
    public void resetPassword(UUID id) {
        User user = repository.findById(id).orElseThrow(() -> new RuntimeException("Usuário não encontrado."));
        user.setPasswordHash(passwordEncoder.encode("odonto123"));
        repository.save(user);
    }
}