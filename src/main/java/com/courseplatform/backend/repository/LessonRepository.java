package com.courseplatform.backend.repository;

import com.courseplatform.backend.entity.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface LessonRepository extends JpaRepository<Lesson, UUID> {
    // Busca todas as aulas de um módulo específico
    List<Lesson> findByModuleId(UUID moduleId);
}