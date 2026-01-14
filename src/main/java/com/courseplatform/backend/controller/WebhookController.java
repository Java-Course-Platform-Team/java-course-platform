package com.courseplatform.backend.controller;

import com.courseplatform.backend.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/webhook")
@RequiredArgsConstructor
public class WebhookController {

    private final PaymentService paymentService;

    @PostMapping("/mercadopago")
    public ResponseEntity<Void> handleNotification(@RequestParam Map<String, String> params) {
        // O Mercado Pago manda algo tipo: /webhook/mercadopago?id=123&topic=payment

        System.out.println("🔔 Notificação recebida: " + params);

        String type = params.get("topic");

        // Às vezes o MP manda 'type' no lugar de 'topic', garantimos os dois
        if (type == null) {
            type = params.get("type");
        }

        if ("payment".equals(type)) {
            String paymentIdStr = params.get("id"); // ou data.id
            if (paymentIdStr != null) {
                Long paymentId = Long.parseLong(paymentIdStr);
                // Chama o serviço para verificar
                paymentService.processPaymentNotification(paymentId);
            }
        }

        // Responde 200 OK rápido pro Mercado Pago não ficar buzinando
        return ResponseEntity.ok().build();
    }
}