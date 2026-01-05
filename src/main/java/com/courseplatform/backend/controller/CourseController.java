package com.courseplatform.backend.controller;

import com.courseplatform.backend.dto.CourseDTO;
import com.courseplatform.backend.dto.LessonCreateDTO;
import com.courseplatform.backend.dto.ModuleCreateDTO;
import com.courseplatform.backend.entity.Course;
import com.courseplatform.backend.entity.Lesson;
import com.courseplatform.backend.entity.Module;
import com.courseplatform.backend.repository.CourseRepository;
import com.courseplatform.backend.service.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseRepository repository;
    private final CourseService service; // <--- ADICIONAMOS O SERVICE AQUI!

    // ==========================================
    // PARTE 1: CURSOS (O que você já tinha)
    // ==========================================

    @GetMapping
    public ResponseEntity<List<Course>> listarCursos() {
        return ResponseEntity.ok(repository.findAll());
    }

    @PostMapping
    public ResponseEntity<Course> criarCurso(@RequestBody CourseDTO dados) {
        System.out.println("Salvando no banco: " + dados.getTitle());

        Course novoCurso = new Course();
        novoCurso.setTitle(dados.getTitle());
        novoCurso.setSlug(dados.getSlug());
        novoCurso.setPrice(dados.getPrice());
        novoCurso.setCategory(dados.getCategory());
        novoCurso.setImageUrl(dados.getImageUrl());
        novoCurso.setDescription(dados.getDescription());

        return ResponseEntity.ok(repository.save(novoCurso));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarCurso(@PathVariable Long id) {
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // ==========================================
    // PARTE 2: MÓDULOS (Novidade!)
    // ==========================================

    @PostMapping("/modules")
    public ResponseEntity<Module> createModule(@RequestBody ModuleCreateDTO dto) {
        return ResponseEntity.ok(service.createModule(dto));
    }

    @GetMapping("/{courseId}/modules")
    public ResponseEntity<List<Module>> listModules(@PathVariable Long courseId) {
        return ResponseEntity.ok(service.listModulesByCourse(courseId));
    }

    // ==========================================
    // PARTE 3: AULAS (Novidade!)
    // ==========================================

    @PostMapping("/lessons")
    public ResponseEntity<Lesson> createLesson(@RequestBody LessonCreateDTO dto) {
        return ResponseEntity.ok(service.createLesson(dto));
    }

    @GetMapping("/modules/{moduleId}/lessons")
    public ResponseEntity<List<Lesson>> listLessons(@PathVariable UUID moduleId) {
        return ResponseEntity.ok(service.listLessonsByModule(moduleId));
    }
}