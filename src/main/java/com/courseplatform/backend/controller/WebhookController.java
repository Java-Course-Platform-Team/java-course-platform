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
        // Log para debug (ver o que o MP está mandando)
        System.out.println("🔔 Webhook MP Recebido: " + params);

        String type = params.get("topic");
        if (type == null) {
            type = params.get("type");
        }

        // Blindagem: Try-Catch para não quebrar se o ID vier estranho
        try {
            if ("payment".equals(type)) {
                String idStr = params.get("id"); // ou data.id

                if (idStr == null) {
                    idStr = params.get("data.id"); // Tentativa extra de pegar o ID
                }

                if (idStr != null) {
                    Long paymentId = Long.parseLong(idStr);
                    System.out.println("Processing Payment ID: " + paymentId);
                    paymentService.processPaymentNotification(paymentId);
                }
            }
        } catch (NumberFormatException e) {
            System.err.println("❌ Erro ao converter ID do pagamento: " + e.getMessage());
            // Não relançamos o erro para não travar o Webhook do MP
        } catch (Exception e) {
            System.err.println("❌ Erro desconhecido no Webhook: " + e.getMessage());
        }

        // SEMPRE responde 200 OK, senão o MP acha que falhou e manda de novo
        return ResponseEntity.ok().build();
    }
}