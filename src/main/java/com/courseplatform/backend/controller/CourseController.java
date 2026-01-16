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
import org.springframework.http.HttpStatus; // <--- Importante para os Status
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException; // <--- Para erros limpos

import java.util.List;
import java.util.UUID;

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
        // Retorna 200 OK com a lista (Vazio ou Cheia)
        return ResponseEntity.ok(repository.findAll());
    }

    @PostMapping
    public ResponseEntity<Course> criarCurso(@RequestBody CourseDTO dados) {
        // 1. Validação Básica (Cliente real precisa disso)
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

        // PROFISSIONAL: Retorna 201 CREATED (Padrão REST)
        return ResponseEntity.status(HttpStatus.CREATED).body(cursoSalvo);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarCurso(@PathVariable Long id) {
        // 1. Verifica se existe antes de tentar apagar
        if (!repository.existsById(id)) {
            // PROFISSIONAL: Retorna 404 NOT FOUND se o ID não existir
            return ResponseEntity.notFound().build();
        }

        repository.deleteById(id);

        // PROFISSIONAL: Retorna 204 NO CONTENT (Sucesso, mas sem corpo)
        return ResponseEntity.noContent().build();
    }

    // ==========================================
    // PARTE 2: MÓDULOS
    // ==========================================

    // ==========================================
    // PARTE 2: MÓDULOS
    // ==========================================

    @PostMapping("/modules")
    public ResponseEntity<Module> createModule(@RequestBody ModuleCreateDTO dto) {
        Module novoModulo = service.createModule(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(novoModulo);
    }

    // --- AQUI ESTÁ A MUDANÇA ---
    @GetMapping("/{courseId}/modules")
    public ResponseEntity<List<ModuleResponseDTO>> listModulesForPlayer(@PathVariable Long courseId) {
        // Agora chamamos o método novo que traz a árvore completa
        return ResponseEntity.ok(service.getCourseModules(courseId));
    }

    // ==========================================
    // PARTE 3: AULAS
    // ==========================================

    @PostMapping("/lessons")
    public ResponseEntity<Lesson> createLesson(@RequestBody LessonCreateDTO dto) {
        Lesson novaAula = service.createLesson(dto);
        // Retorna 201 Created
        return ResponseEntity.status(HttpStatus.CREATED).body(novaAula);
    }

    @GetMapping("/modules/{moduleId}/lessons")
    public ResponseEntity<List<Lesson>> listLessons(@PathVariable UUID moduleId) {
        return ResponseEntity.ok(service.listLessonsByModule(moduleId));
    }
}