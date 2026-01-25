package com.courseplatform.backend.service;

import com.courseplatform.backend.dto.PaymentDTO;
import com.courseplatform.backend.entity.Course;
import com.courseplatform.backend.entity.User;
import com.mercadopago.MercadoPagoConfig;
import com.mercadopago.client.payment.PaymentClient;
import com.mercadopago.client.payment.PaymentCreateRequest;
import com.mercadopago.client.payment.PaymentPayerRequest;
import com.mercadopago.client.preference.PreferenceClient;
import com.mercadopago.client.preference.PreferenceItemRequest;
import com.mercadopago.client.preference.PreferencePayerRequest;
import com.mercadopago.client.preference.PreferenceRequest;
import com.mercadopago.resources.payment.Payment;
import com.mercadopago.resources.preference.Preference;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Collections;

@Service
public class PaymentService {

    @Value("${mercadopago.access_token}")
    private String accessToken;

    // URL do Frontend (Pode vir do application.properties no futuro)
    // Se estiver testando local: http://localhost:8081
    // Se estiver na nuvem: https://seu-frontend.onrender.com
    private final String FRONTEND_URL = "http://localhost:8081"; // <--- Ajuste isso quando subir pra nuvem!

    // Método para pagamentos via PIX (Retorna QR Code e Hash)
    public PaymentDTO createPayment(User user, BigDecimal amount, String description) {
        try {
            MercadoPagoConfig.setAccessToken(accessToken);

            PaymentClient client = new PaymentClient();

            PaymentPayerRequest payer = PaymentPayerRequest.builder()
                    .email(user.getEmail())
                    .firstName(user.getName())
                    .build();

            PaymentCreateRequest paymentCreateRequest = PaymentCreateRequest.builder()
                    .transactionAmount(amount)
                    .description(description)
                    .paymentMethodId("pix")
                    .payer(payer)
                    .build();

            Payment payment = client.create(paymentCreateRequest);

            return new PaymentDTO(
                    payment.getId().toString(),
                    payment.getStatus(),
                    payment.getPointOfInteraction().getTransactionData().getQrCode(),
                    payment.getPointOfInteraction().getTransactionData().getQrCodeBase64()
            );

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Erro ao processar pagamento: " + e.getMessage());
        }
    }

    // Método para criar Link de Pagamento (Preference / Checkout Pro)
    public String createPaymentLink(Course course, User user) {
        try {
            MercadoPagoConfig.setAccessToken(accessToken);

            PreferenceClient client = new PreferenceClient();

            PreferenceItemRequest item = PreferenceItemRequest.builder()
                    .title(course.getTitle())
                    .quantity(1)
                    .unitPrice(course.getPrice())
                    .build();

            PreferencePayerRequest payer = PreferencePayerRequest.builder()
                    .email(user.getEmail())
                    .name(user.getName())
                    .build();

            // --- CORREÇÃO DE REDIRECIONAMENTO ---
            // Apontando para páginas que existem no seu projeto (pasta /aluno ou /static)
            PreferenceRequest request = PreferenceRequest.builder()
                    .items(Collections.singletonList(item))
                    .payer(payer)
                    .backUrls(com.mercadopago.client.preference.PreferenceBackUrlsRequest.builder()
                            .success(FRONTEND_URL + "/aluno/pagamento-sucesso.html") // Página de obrigado
                            .failure(FRONTEND_URL + "/index.html?error=payment_failed")
                            .pending(FRONTEND_URL + "/index.html?warning=payment_pending")
                            .build())
                    .autoReturn("approved")
                    .build();

            Preference preference = client.create(request);

            return preference.getInitPoint();

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Erro ao criar link de pagamento: " + e.getMessage());
        }
    }

    public void processPaymentNotification(Long paymentId) {
        try {
            MercadoPagoConfig.setAccessToken(accessToken);
            PaymentClient client = new PaymentClient();
            Payment payment = client.get(paymentId);

            System.out.println("Processando notificação para o pagamento: " + paymentId);
            System.out.println("Status atual: " + payment.getStatus());

        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("Erro ao processar notificação de pagamento: " + e.getMessage());
        }
    }
}