package com.courseplatform.backend.controller;

import com.courseplatform.backend.dto.UserCreateDTO; // Certifique-se de que este DTO existe
import com.courseplatform.backend.entity.User;
import com.courseplatform.backend.repository.UserRepository;
import com.courseplatform.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService service;
    private final UserRepository repository;

    // MÉTODO QUE ESTAVA EM FALTA: Processa o cadastro do auth.js
    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody UserCreateDTO dto) {
        User newUser = service.registerUser(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(newUser);
    }

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(service.listAllUsers());
    }

    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<User> toggleUserStatus(@PathVariable UUID id) {
        User user = repository.findById(id).orElseThrow();
        user.setIsActive(!Boolean.TRUE.equals(user.getIsActive()));
        return ResponseEntity.ok(repository.save(user));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable UUID id) {
        service.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable UUID id, @RequestBody User user) {
        return ResponseEntity.ok(service.updateUser(id, user));
    }

    @PatchMapping("/{id}/reset-password")
    public ResponseEntity<Void> resetPassword(@PathVariable UUID id) {
        service.resetPassword(id);
        return ResponseEntity.ok().build();
    }
}