package com.courseplatform.backend.repository;

import com.courseplatform.backend.entity.Progress;
import com.courseplatform.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface ProgressRepository extends JpaRepository<Progress, UUID> {
    // Busca tudo que um aluno já completou
    List<Progress> findByUser(User user);

    // Verifica se já completou (pra não salvar duplicado)
    boolean existsByUserAndLessonId(User user, UUID lessonId);
}