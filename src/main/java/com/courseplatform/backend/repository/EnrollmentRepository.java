package com.courseplatform.backend.repository;

import com.courseplatform.backend.entity.Course;
import com.courseplatform.backend.entity.Enrollment;
import com.courseplatform.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID; // <--- Importante: UUID estava faltando ou não sendo usado no extends

// CORREÇÃO: Mudamos de Long para UUID aqui embaixo 👇
public interface EnrollmentRepository extends JpaRepository<Enrollment, UUID> {

    List<Enrollment> findByUser(User user);

    boolean existsByUserAndCourse(User user, Course course);

    @Query("SELECT SUM(c.price) FROM Enrollment e JOIN e.course c")
    BigDecimal calculateTotalRevenue();
}