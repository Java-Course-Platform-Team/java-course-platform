package com.courseplatform.backend.service;

import com.courseplatform.backend.dto.LessonCreateDTO;
import com.courseplatform.backend.dto.LessonResponseDTO;
import com.courseplatform.backend.dto.ModuleCreateDTO;
import com.courseplatform.backend.dto.ModuleResponseDTO;
import com.courseplatform.backend.entity.Course;
import com.courseplatform.backend.entity.Lesson;
import com.courseplatform.backend.entity.Module;
import com.courseplatform.backend.repository.CourseRepository;
import com.courseplatform.backend.repository.LessonRepository;
import com.courseplatform.backend.repository.ModuleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID; // <--- Importante

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;
    private final ModuleRepository moduleRepository;
    private final LessonRepository lessonRepository;

    // --- 1. CRIAR MÓDULO ---
    public Module createModule(ModuleCreateDTO dto) {
        // Primeiro, achamos o pai (O Curso)
        // OBS: Certifique-se que dto.getCourseId() retorna UUID
        Course course = courseRepository.findById(dto.getCourseId())
                .orElseThrow(() -> new RuntimeException("Curso não encontrado com ID: " + dto.getCourseId()));

        Module module = new Module();
        module.setTitle(dto.getTitle());
        module.setDescription(dto.getDescription());
        module.setCourse(course); // Amarra o módulo no curso

        return moduleRepository.save(module);
    }

    // --- 2. CRIAR AULA ---
    public Lesson createLesson(LessonCreateDTO dto) {
        // Primeiro, achamos o pai (O Módulo)
        Module module = moduleRepository.findById(dto.getModuleId())
                .orElseThrow(() -> new RuntimeException("Módulo não encontrado com ID: " + dto.getModuleId()));

        Lesson lesson = new Lesson();
        lesson.setTitle(dto.getTitle());
        lesson.setDescription(dto.getDescription());
        lesson.setVideoUrl(dto.getVideoUrl());
        lesson.setDurationSeconds(dto.getDurationSeconds());
        lesson.setModule(module); // Amarra a aula no módulo

        return lessonRepository.save(lesson);
    }

    // Lista os módulos de um curso (para a gente testar depois)
    // --- MUDOU DE LONG PARA UUID AQUI EMBAIXO 👇 ---
    public List<Module> listModulesByCourse(UUID courseId) {
        return moduleRepository.findByCourseId(courseId);
    }

    // Lista as aulas de um módulo
    public List<Lesson> listLessonsByModule(UUID moduleId) {
        return lessonRepository.findByModuleId(moduleId);
    }

    // === NOVO MÉTODO PARA O PLAYER (A ÁRVORE DE CONTEÚDO) ===
    // --- MUDOU DE LONG PARA UUID AQUI EMBAIXO 👇 ---
    public List<ModuleResponseDTO> getCourseModules(UUID courseId) {

        // 1. Busca todos os módulos do curso
        List<Module> modules = moduleRepository.findByCourseId(courseId);

        // 2. Transforma cada Módulo (Entity) em um ModuleResponseDTO
        return modules.stream().map(module -> {

            // 2.1. Busca as aulas desse módulo específico
            List<Lesson> lessons = lessonRepository.findByModuleId(module.getId());

            // 2.2. Transforma as Aulas (Entity) em LessonResponseDTO
            List<LessonResponseDTO> lessonDTOs = lessons.stream()
                    .map(l -> new LessonResponseDTO(
                            l.getId(),
                            l.getTitle(),
                            l.getVideoUrl(),
                            l.getDurationSeconds()
                    ))
                    .toList();

            // 2.3. Retorna o Módulo preenchido com suas aulas
            return new ModuleResponseDTO(module.getId(), module.getTitle(), lessonDTOs);

        }).toList();
    }
}