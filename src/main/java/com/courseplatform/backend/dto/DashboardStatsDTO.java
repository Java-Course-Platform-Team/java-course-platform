package com.courseplatform.backend.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class DashboardStatsDTO {
    private long totalStudents;
    private long totalCourses;
    private long totalEnrollments;
    private BigDecimal totalRevenue;
}