package com.courseplatform.backend.controller;

import com.courseplatform.backend.dto.CourseDTO;
import com.courseplatform.backend.dto.LessonCreateDTO;
import com.courseplatform.backend.dto.ModuleCreateDTO;
import com.courseplatform.backend.dto.ModuleResponseDTO;
import com.courseplatform.backend.entity.Course;
import com.courseplatform.backend.entity.Lesson;
import com.courseplatform.backend.entity.Module;
import com.courseplatform.backend.repository.CourseRepository;
import com.courseplatform.backend.service.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID; // <--- Importante

@RestController
@RequestMapping("/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseRepository repository;
    private final CourseService service;

    // ==========================================
    // PARTE 1: CURSOS
    // ==========================================

    @GetMapping
    public ResponseEntity<List<Course>> listarCursos() {
        return ResponseEntity.ok(repository.findAll());
    }

    @PostMapping
    public ResponseEntity<Course> criarCurso(@RequestBody CourseDTO dados) {
        if (dados.getTitle() == null || dados.getTitle().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O título do curso é obrigatório.");
        }

        System.out.println("Salvando no banco: " + dados.getTitle());

        Course novoCurso = new Course();
        novoCurso.setTitle(dados.getTitle());
        novoCurso.setSlug(dados.getSlug());
        novoCurso.setPrice(dados.getPrice());
        novoCurso.setCategory(dados.getCategory());
        novoCurso.setImageUrl(dados.getImageUrl());
        novoCurso.setDescription(dados.getDescription());

        Course cursoSalvo = repository.save(novoCurso);

        return ResponseEntity.status(HttpStatus.CREATED).body(cursoSalvo);
    }

    // --- CORRIGIDO AQUI EMBAIXO (Long -> UUID) ---
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarCurso(@PathVariable UUID id) {
        if (!repository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        repository.deleteById(id);

        return ResponseEntity.noContent().build();
    }

    // ==========================================
    // PARTE 2: MÓDULOS
    // ==========================================

    @PostMapping("/modules")
    public ResponseEntity<Module> createModule(@RequestBody ModuleCreateDTO dto) {
        Module novoModulo = service.createModule(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(novoModulo);
    }

    // --- CORRIGIDO AQUI EMBAIXO (Long -> UUID) ---
    @GetMapping("/{courseId}/modules")
    public ResponseEntity<List<ModuleResponseDTO>> listModulesForPlayer(@PathVariable UUID courseId) {
        // O service.getCourseModules também precisa esperar um UUID lá dentro!
        return ResponseEntity.ok(service.getCourseModules(courseId));
    }

    // ==========================================
    // PARTE 3: AULAS
    // ==========================================

    @PostMapping("/lessons")
    public ResponseEntity<Lesson> createLesson(@RequestBody LessonCreateDTO dto) {
        Lesson novaAula = service.createLesson(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(novaAula);
    }

    @GetMapping("/modules/{moduleId}/lessons")
    public ResponseEntity<List<Lesson>> listLessons(@PathVariable UUID moduleId) {
        return ResponseEntity.ok(service.listLessonsByModule(moduleId));
    }
}