package com.courseplatform.backend.repository;

import com.courseplatform.backend.entity.Enrollment;
import com.courseplatform.backend.entity.User;
import com.courseplatform.backend.entity.Course; // Importante
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query; // Importante

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public interface EnrollmentRepository extends JpaRepository<Enrollment, UUID> {

    boolean existsByUserAndCourse(User user, Course course);

    List<Enrollment> findByUser(User user);

    // --- A MÁGICA DO FATURAMENTO ---
    // Essa Query soma (SUM) o preço (c.price) de todos os cursos (c)
    // que estão dentro da tabela de matrículas (Enrollment e).
    @Query("SELECT SUM(c.price) FROM Enrollment e JOIN e.course c")
    BigDecimal calculateTotalRevenue();
}