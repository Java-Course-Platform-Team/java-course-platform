package com.courseplatform.backend.repository;

import com.courseplatform.backend.entity.Course;
import com.courseplatform.backend.entity.Enrollment;
import com.courseplatform.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query; // Import para o AdminController
import java.math.BigDecimal; // Import para o AdminController
import java.util.List;

public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {


    List<Enrollment> findByUser(User user);


    boolean existsByUserAndCourse(User user, Course course);


    @Query("SELECT SUM(c.price) FROM Enrollment e JOIN e.course c")
    BigDecimal calculateTotalRevenue();
}