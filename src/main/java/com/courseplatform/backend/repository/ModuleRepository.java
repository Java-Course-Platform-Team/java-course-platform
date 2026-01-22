package com.courseplatform.backend.repository;

import com.courseplatform.backend.entity.Module;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface ModuleRepository extends JpaRepository<Module, UUID> {

    List<Module> findByCourseId(UUID courseId);
}