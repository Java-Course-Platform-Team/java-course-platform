package com.courseplatform.backend.repository;

import com.courseplatform.backend.entity.Progress;
import com.courseplatform.backend.entity.User;
import com.courseplatform.backend.entity.Lesson; // Importante!
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface ProgressRepository extends JpaRepository<Progress, UUID> {

    // Busca todo o progresso daquele aluno
    List<Progress> findByUser(User user);

    // --- CORREÇÃO AQUI ---
    // Antes: existsByUserAndLessonId (procurava um número)
    // Agora: existsByUserAndLesson (procura o objeto real, garantindo integridade)
    boolean existsByUserAndLesson(User user, Lesson lesson);
}