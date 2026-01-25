package com.courseplatform.backend.service;

import com.courseplatform.backend.dto.PaymentDTO;
import com.courseplatform.backend.entity.Course;
import com.courseplatform.backend.entity.User;
import com.mercadopago.MercadoPagoConfig;
import com.mercadopago.client.payment.PaymentClient;
import com.mercadopago.client.payment.PaymentCreateRequest;
import com.mercadopago.client.payment.PaymentPayerRequest;
import com.mercadopago.client.preference.PreferenceBackUrlsRequest;
import com.mercadopago.client.preference.PreferenceClient;
import com.mercadopago.client.preference.PreferenceItemRequest;
import com.mercadopago.client.preference.PreferencePayerRequest;
import com.mercadopago.client.preference.PreferenceRequest;
import com.mercadopago.resources.payment.Payment;
import com.mercadopago.resources.preference.Preference;
import com.mercadopago.exceptions.MPApiException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Collections;

@Service
public class PaymentService {

    @Value("${mercadopago.access_token}")
    private String accessToken;

    // 1. Pagamento via PIX
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
            throw new RuntimeException("Erro no PIX: " + e.getMessage());
        }
    }

    // 2. Link de Pagamento (Checkout Pro) - VERSÃO BLINDADA
    // Método para criar Link de Pagamento (Preference / Checkout Pro)
    public String createPaymentLink(Course course, User user) {
        try {
            MercadoPagoConfig.setAccessToken(accessToken);

            PreferenceClient client = new PreferenceClient();

            // Item
            PreferenceItemRequest item = PreferenceItemRequest.builder()
                    .title(course.getTitle())
                    .quantity(1)
                    .currencyId("BRL")
                    .unitPrice(course.getPrice())
                    .build();

            // Payer
            PreferencePayerRequest payer = PreferencePayerRequest.builder()
                    .email(user.getEmail())
                    .name(user.getName())
                    .build();

            // URLs de Retorno
            PreferenceBackUrlsRequest backUrls = PreferenceBackUrlsRequest.builder()
                    .success("http://localhost:8081/aluno/pagamento-sucesso.html")
                    .failure("http://localhost:8081/index.html?error=payment_failed")
                    .pending("http://localhost:8081/index.html?warning=payment_pending")
                    .build();

            // Request
            PreferenceRequest request = PreferenceRequest.builder()
                    .items(Collections.singletonList(item))
                    .payer(payer)
                    .backUrls(backUrls)
                    // 👇 AQUI ESTÁ A MUDANÇA: Comentamos o autoReturn para o MP parar de reclamar
                    // .autoReturn("approved")
                    .build();

            Preference preference = client.create(request);

            System.out.println("✅ Link gerado com sucesso: " + preference.getInitPoint());
            return preference.getInitPoint();

        } catch (MPApiException e) {
            System.err.println("❌ ERRO MP API: " + e.getApiResponse().getStatusCode());
            System.err.println("📄 PAYLOAD: " + e.getApiResponse().getContent());
            throw new RuntimeException("Erro MP: " + e.getApiResponse().getContent());
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Erro genérico: " + e.getMessage());
        }
    }

    // 3. Webhook
    public void processPaymentNotification(Long paymentId) {
        try {
            MercadoPagoConfig.setAccessToken(accessToken);
            PaymentClient client = new PaymentClient();
            Payment payment = client.get(paymentId);
            System.out.println("🔔 Webhook: " + payment.getStatus());
        } catch (Exception e) {
            System.err.println("Erro Webhook: " + e.getMessage());
        }
    }
}