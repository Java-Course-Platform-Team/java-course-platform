package com.courseplatform.backend.controller;

import com.courseplatform.backend.dto.UserCreateDTO;
import com.courseplatform.backend.entity.User;
import com.courseplatform.backend.repository.UserRepository;
import com.courseplatform.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID; // <--- Importante para o seu ID

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService service;

    @Autowired
    private UserRepository repository;

    @PostMapping
    public ResponseEntity<User> createUser (@RequestBody UserCreateDTO dto) {
        User newUser = service.registerUser(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(newUser);
    }

    // LISTAR ALUNOS (Para a tabela do Admin)
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = service.listAllUsers();
        return ResponseEntity.ok(users);
    }

    // BANIR / DESBANIR (Ajustado para UUID)
    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<User> toggleUserStatus(@PathVariable UUID id) { // <--- Recebe UUID
        Optional<User> userOp = repository.findById(id);

        if (userOp.isPresent()) {
            User user = userOp.get();
            // Inverte o status (se era true vira false)
            // Usamos Boolean.TRUE.equals para evitar erro se for nulo
            boolean novoStatus = !Boolean.TRUE.equals(user.getIsActive());

            user.setIsActive(novoStatus);
            repository.save(user);

            return ResponseEntity.ok(user);
        }
        return ResponseEntity.notFound().build();
    }
}