package com.courseplatform.backend.service;

import com.courseplatform.backend.entity.Course;
import com.courseplatform.backend.entity.User;
import com.courseplatform.backend.repository.CourseRepository;
import com.courseplatform.backend.repository.UserRepository;
import com.mercadopago.client.common.IdentificationRequest;
import com.mercadopago.client.payment.PaymentClient;
import com.mercadopago.client.preference.*;
import com.mercadopago.exceptions.MPApiException; // <--- IMPORTANTE: Import novo para tratar o erro
import com.mercadopago.resources.payment.Payment;
import com.mercadopago.resources.preference.Preference;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class PaymentService {

    @Autowired
    private EnrollmentService enrollmentService;
    @Autowired
    private CourseRepository courseRepository;
    @Autowired
    private UserRepository userRepository;

    // MÉTODO 1: GERA O LINK (IDA)
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
                    .success("http://localhost:8081/aluno/sucesso.html") // Jhon precisa criar isso
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
                    // 👇 IMPORTANTE: Avisa o MP onde chamar o webhook (Só funciona com HTTPS/Ngrok ou Deploy)
                    // Se estiver testando local sem Ngrok, o MP vai ignorar, mas precisa estar aqui pro futuro.
                    .notificationUrl("https://seusite.com/webhook/payment")
                    .build();

            // 5. CRIAÇÃO DO LINK REAL (COM O TRATAMENTO DE ERRO DO JHON)
            PreferenceClient client = new PreferenceClient();

            try {
                Preference preference = client.create(preferenceRequest);
                return preference.getInitPoint();
            } catch (MPApiException e) {
                // 🚨 AQUI ESTÁ O QUE O JHON PEDIU: O ERRO DETALHADO DO MP
                System.err.println("❌ ERRO CRÍTICO MERCADO PAGO: " + e.getApiResponse().getContent());
                throw new RuntimeException("Erro ao gerar link MP: " + e.getMessage());
            }

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Erro ao criar pagamento no Mercado Pago", e);
        }
    }

    // MÉTODO 2: PROCESSA A NOTIFICAÇÃO (VOLTA)
    public void processPaymentNotification(Long paymentId) {
        try {
            System.out.println("🔔 WEBHOOK: Verificando pagamento ID: " + paymentId);

            PaymentClient client = new PaymentClient();
            Payment payment = client.get(paymentId);
            String status = payment.getStatus();
            System.out.println("📊 Status atual no Mercado Pago: " + status);

            if ("approved".equals(status)) {
                String externalRef = payment.getExternalReference();

                if (externalRef != null) {
                    String[] parts = externalRef.split("_");
                    Long courseId = Long.parseLong(parts[0]);
                    UUID userId = UUID.fromString(parts[1]);

                    System.out.println("🎁 Liberando curso " + courseId + " para aluno " + userId);

                    var course = courseRepository.findById(courseId).orElseThrow();
                    var user = userRepository.findById(userId).orElseThrow();

                    enrollmentService.enrollStudent(user, course);
                }
            }
        } catch (Exception e) {
            System.err.println("❌ Erro no Webhook: " + e.getMessage());
        }
    }
}