package com.courseplatform.backend.repository;

import com.courseplatform.backend.entity.Module;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface ModuleRepository extends JpaRepository<Module, UUID> {
    // Essa linha mágica permite buscar todos os módulos de um curso específico
    List<Module> findByCourseId(Long courseId);
}