package com.courseplatform.backend.service;

import com.courseplatform.backend.entity.Course;
import com.courseplatform.backend.entity.User;
import com.courseplatform.backend.repository.CourseRepository; // <--- NOVO
import com.courseplatform.backend.repository.UserRepository;   // <--- NOVO
import com.mercadopago.client.common.IdentificationRequest;
import com.mercadopago.client.payment.PaymentClient; // <--- NOVO
import com.mercadopago.client.preference.*;
import com.mercadopago.resources.payment.Payment;   // <--- NOVO
import com.mercadopago.resources.preference.Preference;
import org.springframework.beans.factory.annotation.Autowired; // <--- NOVO
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID; // <--- NOVO

@Service
public class PaymentService {

    // 👇 Injeção de dependências necessárias para o Webhook
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
                    // 👇 AQUI É O SEGREDO: Enviamos ID_CURSO + "_" + ID_USER para recuperar depois
                    .externalReference(course.getId() + "_" + user.getId())
                    .statementDescriptor("ODONTOPRO")
                    .build();

            // 5. CRIAÇÃO DO LINK REAL
            PreferenceClient client = new PreferenceClient();
            Preference preference = client.create(preferenceRequest);

            return preference.getInitPoint();

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Erro ao criar pagamento no Mercado Pago", e);
        }
    }

    // MÉTODO 2: PROCESSA A NOTIFICAÇÃO (VOLTA - NOVO! 🆕)
    public void processPaymentNotification(Long paymentId) {
        try {
            System.out.println("🔔 WEBHOOK: Verificando pagamento ID: " + paymentId);

            // 1. Pergunta pro Mercado Pago o status real
            PaymentClient client = new PaymentClient();
            Payment payment = client.get(paymentId);
            String status = payment.getStatus();
            System.out.println("📊 Status atual no Mercado Pago: " + status);

            // 2. Se estiver APROVADO, libera o curso
            if ("approved".equals(status)) {
                // Recupera quem é o aluno e qual o curso pelo código que enviamos antes
                String externalRef = payment.getExternalReference();
                // Exemplo de ref: "12_a1b2-c3d4-..." (idCurso_idUser)

                if (externalRef != null) {
                    String[] parts = externalRef.split("_");
                    Long courseId = Long.parseLong(parts[0]);
                    UUID userId = UUID.fromString(parts[1]);

                    System.out.println("🎁 Liberando curso " + courseId + " para aluno " + userId);

                    // Busca no banco
                    var course = courseRepository.findById(courseId).orElseThrow();
                    var user = userRepository.findById(userId).orElseThrow();

                    // Matricula o aluno!
                    enrollmentService.enrollStudent(user, course);
                }
            }
        } catch (Exception e) {
            System.err.println("❌ Erro no Webhook: " + e.getMessage());
            // Não lançamos erro aqui para não travar a resposta 200 OK pro Mercado Pago
        }
    }
}