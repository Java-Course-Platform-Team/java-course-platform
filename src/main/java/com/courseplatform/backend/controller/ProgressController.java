package com.courseplatform.backend.controller;

import com.courseplatform.backend.entity.Progress;
import com.courseplatform.backend.entity.User;
import com.courseplatform.backend.repository.ProgressRepository;
import com.courseplatform.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/progress")
public class ProgressController {

    @Autowired
    private ProgressRepository progressRepository;

    @Autowired
    private UserRepository userRepository;

    // MARCAR AULA COMO VISTA
    @PostMapping("/{lessonId}")
    public ResponseEntity<?> markAsDone(@PathVariable UUID lessonId, @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();

        if (!progressRepository.existsByUserAndLessonId(user, lessonId)) {
            Progress progress = new Progress();
            progress.setUser(user);
            progress.setLessonId(lessonId);
            progressRepository.save(progress);
        }

        return ResponseEntity.ok().build();
    }

    // LISTAR AULAS VISTAS (Para pintar de verde no menu)
    @GetMapping
    public ResponseEntity<List<UUID>> getMyProgress(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();

        List<UUID> completedLessonIds = progressRepository.findByUser(user)
                .stream()
                .map(Progress::getLessonId)
                .collect(Collectors.toList());

        return ResponseEntity.ok(completedLessonIds);
    }
}