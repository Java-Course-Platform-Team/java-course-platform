package com.courseplatform.backend.controller;

import com.courseplatform.backend.dto.LoginDTO;
import com.courseplatform.backend.dto.LoginResponseDTO;
import com.courseplatform.backend.dto.UserCreateDTO;
import com.courseplatform.backend.entity.User;
import com.courseplatform.backend.service.AuthService;
import com.courseplatform.backend.service.TokenService;
import com.courseplatform.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserService userService;

    @Autowired
    private TokenService tokenService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@RequestBody @Valid LoginDTO loginDTO) {
        User user = authService.authenticate(loginDTO.getEmail(), loginDTO.getPassword());
        String token = tokenService.generateToken(user);
        return ResponseEntity.ok(new LoginResponseDTO(token, user));
    }

    @PostMapping("/register")
    public ResponseEntity<User> register(@RequestBody @Valid UserCreateDTO userCreateDTO) {
        User newUser = userService.createUser(userCreateDTO);
        return ResponseEntity.ok(newUser);
    }
}