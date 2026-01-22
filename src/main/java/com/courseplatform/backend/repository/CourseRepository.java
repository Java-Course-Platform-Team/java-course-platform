package com.courseplatform.backend.repository;

import com.courseplatform.backend.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID; // <--- O segredo está aqui

@Repository

public interface CourseRepository extends JpaRepository<Course, UUID> {
}