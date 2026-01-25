package com.courseplatform.backend.controller;

import com.courseplatform.backend.entity.Lesson; // Importante
import com.courseplatform.backend.entity.Progress;
import com.courseplatform.backend.entity.User;
import com.courseplatform.backend.repository.LessonRepository; // Importante
import com.courseplatform.backend.repository.ProgressRepository;
import com.courseplatform.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/progress")
public class ProgressController {

    @Autowired
    private ProgressRepository progressRepository;

    @Autowired
    private UserRepository userRepository;

    // --- CORREÇÃO 1: Precisamos do LessonRepository ---
    @Autowired
    private LessonRepository lessonRepository;

    // MARCAR AULA COMO VISTA
    @PostMapping("/{lessonId}")
    public ResponseEntity<?> markAsDone(@PathVariable UUID lessonId, @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        // --- CORREÇÃO 2: Buscamos a aula no banco primeiro ---
        // Isso impede que alguém marque "visto" numa aula que não existe (Erro 404 se não achar)
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Aula não encontrada"));

        // Verifica se já existe o relacionamento User <-> Lesson
        if (!progressRepository.existsByUserAndLesson(user, lesson)) {
            Progress progress = new Progress();
            progress.setUser(user);

            // Agora salvamos o OBJETO aula, não só o ID
            progress.setLesson(lesson);

            progressRepository.save(progress);
        }

        return ResponseEntity.ok().build();
    }

    // LISTAR AULAS VISTAS
    @GetMapping
    public ResponseEntity<List<UUID>> getMyProgress(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();

        List<UUID> completedLessonIds = progressRepository.findByUser(user)
                .stream()
                // --- CORREÇÃO 3: Navegamos pelo objeto para pegar o ID ---
                .map(progress -> progress.getLesson().getId())
                .collect(Collectors.toList());

        return ResponseEntity.ok(completedLessonIds);
    }
}