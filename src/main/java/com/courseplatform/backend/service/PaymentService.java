package com.courseplatform.backend.service;

import com.courseplatform.backend.entity.Course;
import com.courseplatform.backend.entity.User;
import com.mercadopago.client.common.IdentificationRequest;
import com.mercadopago.client.preference.*;
import com.mercadopago.resources.preference.Preference;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class PaymentService {

    public String createPaymentLink(Course course, User user) {
        try {
            // --- 🚨 MODO DE EMERGÊNCIA (MOCK) ---
            // Como o site do Mercado Pago está OFF, vamos pular a chamada real
            // para não dar erro 500.

            System.out.println("⚠️ SIMULANDO PAGAMENTO PARA: " + course.getTitle());
            System.out.println("⚠️ USUÁRIO: " + user.getName());

            // Retornamos um link falso só para o Postman ficar feliz (200 OK)
            return "https://sandbox.mercadopago.com.br/checkout/v1/redirect?pref_id=TEST-LINK-FAKE-123";

            /* 🔴 CÓDIGO REAL (DESCOMENTAR QUANDO TIVER O TOKEN REAL)

            // 1. O QUE ESTÁ SENDO VENDIDO?
            PreferenceItemRequest itemRequest = PreferenceItemRequest.builder()
                    .id(course.getId().toString())
                    .title(course.getTitle())
                    .description("Acesso ao curso: " + course.getTitle())
                    .pictureUrl(course.getImageUrl())
                    .categoryId("learnings")
                    .quantity(1)
                    .currencyId("BRL")
                    .unitPrice(course.getPrice())
                    .build();

            List<PreferenceItemRequest> items = new ArrayList<>();
            items.add(itemRequest);

            // 2. QUEM ESTÁ COMPRANDO?
            PreferencePayerRequest payerRequest = PreferencePayerRequest.builder()
                    .name(user.getName())
                    .email(user.getEmail())
                    .identification(
                            IdentificationRequest.builder()
                                    .type("CPF")
                                    .number(user.getCpf())
                                    .build()
                    )
                    .build();

            // 3. PRA ONDE VAI DEPOIS?
            PreferenceBackUrlsRequest backUrls = PreferenceBackUrlsRequest.builder()
                    .success("http://localhost:8081/aluno/sucesso.html")
                    .pending("http://localhost:8081/aluno/pendente.html")
                    .failure("http://localhost:8081/aluno/erro.html")
                    .build();

            // 4. PREFERENCIA
            PreferenceRequest preferenceRequest = PreferenceRequest.builder()
                    .items(items)
                    .payer(payerRequest)
                    .backUrls(backUrls)
                    .autoReturn("approved")
                    .externalReference(course.getId() + "_" + user.getId())
                    .statementDescriptor("ODONTOPRO")
                    .build();

            PreferenceClient client = new PreferenceClient();
            Preference preference = client.create(preferenceRequest);

            return preference.getInitPoint();
            */

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Erro ao criar pagamento no Mercado Pago", e);
        }
    }
}