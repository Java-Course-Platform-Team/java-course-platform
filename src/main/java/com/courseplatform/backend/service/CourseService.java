package com.courseplatform.backend.service;

import com.courseplatform.backend.dto.LessonCreateDTO;
import com.courseplatform.backend.dto.ModuleCreateDTO;
import com.courseplatform.backend.entity.Course;
import com.courseplatform.backend.entity.Lesson;
import com.courseplatform.backend.entity.Module;
import com.courseplatform.backend.repository.CourseRepository;
import com.courseplatform.backend.repository.LessonRepository;
import com.courseplatform.backend.repository.ModuleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;
    private final ModuleRepository moduleRepository;
    private final LessonRepository lessonRepository;

    // --- 1. CRIAR MÓDULO ---
    public Module createModule(ModuleCreateDTO dto) {
        // Primeiro, achamos o pai (O Curso)
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
    public List<Module> listModulesByCourse(Long courseId) {
        return moduleRepository.findByCourseId(courseId);
    }

    // Lista as aulas de um módulo
    public List<Lesson> listLessonsByModule(UUID moduleId) {
        return lessonRepository.findByModuleId(moduleId);
    }
}