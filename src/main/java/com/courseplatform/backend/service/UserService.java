package com.courseplatform.backend.service;

import com.courseplatform.backend.Role;
import com.courseplatform.backend.dto.UserCreateDTO;
import com.courseplatform.backend.entity.User;
import com.courseplatform.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;

    public User registerUser(UserCreateDTO dto) {
        // 👇 ADICIONE ESSA LINHA AQUI! ELA VAI SALVAR SUA VIDA.
        System.out.println("O QUE CHEGOU DO FRONTEND: " + dto.toString());
        if (repository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Erro: Email já cadastrado no sistema!");
        }

        User newUser = new User();
        newUser.setName(dto.getName());
        newUser.setEmail(dto.getEmail());

        // AQUI ESTÁ A CORREÇÃO 👇
        newUser.setCpf(dto.getCpf()); // Agora pega o CPF do envelope e joga no usuário

        String senhaCriptografada = passwordEncoder.encode(dto.getPassword());
        newUser.setPasswordHash(senhaCriptografada);
        newUser.setRole(Role.STUDENT);

        return repository.save(newUser);
    }

    // Este método permite que o UserController pegue a lista do banco
    public List<User> listAllUsers() {
        return repository.findAll();
    }
}