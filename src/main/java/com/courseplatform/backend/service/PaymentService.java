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

            // 4. PREFERÊNCIA FINAL
            PreferenceRequest preferenceRequest = PreferenceRequest.builder()
                    .items(items)
                    .payer(payerRequest)
                    .backUrls(backUrls)
                    .autoReturn("approved")
                    .externalReference(course.getId() + "_" + user.getId())
                    .statementDescriptor("ODONTOPRO")
                    .build();

            // 5. CRIAÇÃO DO LINK REAL
            PreferenceClient client = new PreferenceClient();
            Preference preference = client.create(preferenceRequest);

            return preference.getInitPoint(); // Retorna o link verdadeiro

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Erro ao criar pagamento no Mercado Pago", e);
        }
    }
}