package com.courseplatform.backend.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class PaymentRequestDTO {
    private UUID userId;
    private UUID courseId;
}