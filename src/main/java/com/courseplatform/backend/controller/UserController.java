package com.courseplatform.backend.controller;

import com.courseplatform.backend.dto.UserCreateDTO;
import com.courseplatform.backend.entity.User;
import com.courseplatform.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UserService service;

    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody @Valid UserCreateDTO dto) {
        // Ajustado para chamar createUser em vez de registerUser
        return ResponseEntity.ok(service.createUser(dto));
    }

    @GetMapping
    public ResponseEntity<List<User>> listAll() {
        return ResponseEntity.ok(service.listAllUsers());
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

    @PostMapping("/{id}/reset-password")
    public ResponseEntity<Void> resetPassword(@PathVariable UUID id) {
        service.resetPassword(id);
        return ResponseEntity.ok().build();
    }
}