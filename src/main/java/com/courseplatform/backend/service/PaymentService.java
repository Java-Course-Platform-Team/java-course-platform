package com.courseplatform.backend.service;

import com.courseplatform.backend.dto.PaymentDTO;
import com.courseplatform.backend.entity.Course;
import com.courseplatform.backend.entity.Enrollment;
import com.courseplatform.backend.entity.User;
import com.courseplatform.backend.repository.CourseRepository;
import com.courseplatform.backend.repository.EnrollmentRepository;
import com.courseplatform.backend.repository.UserRepository;
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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.UUID; // <--- Importante para converter os IDs

@Service
public class PaymentService {

    @Value("${mercadopago.access_token}")
    private String accessToken;

    // URL DO SEU SITE NA NUVEM
    private final String BACKEND_URL = "https://odonto-backend-j9oy.onrender.com";

    @Autowired private EnrollmentRepository enrollmentRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private CourseRepository courseRepository;

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

    // 2. Link de Pagamento (Checkout Pro)
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
                    .success(BACKEND_URL + "/aluno/area-aluno.html")
                    .failure(BACKEND_URL + "/aluno/catalogo.html")
                    .pending(BACKEND_URL + "/aluno/area-aluno.html")
                    .build();

            // External Reference: "ID_USER__ID_CURSO"
            String customId = user.getId() + "__" + course.getId();

            PreferenceRequest request = PreferenceRequest.builder()
                    .items(Collections.singletonList(item))
                    .payer(payer)
                    .backUrls(backUrls)
                    .autoReturn("approved")
                    .externalReference(customId)
                    .notificationUrl(BACKEND_URL + "/webhook/mercadopago")
                    .build();

            Preference preference = client.create(request);

            System.out.println("✅ Link Render gerado: " + preference.getInitPoint());
            return preference.getInitPoint();

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Erro ao gerar link MP: " + e.getMessage());
        }
    }

    // 3. Webhook
    public void processPaymentNotification(Long paymentId) {
        try {
            MercadoPagoConfig.setAccessToken(accessToken);
            PaymentClient client = new PaymentClient();

            Payment payment = client.get(paymentId);
            System.out.println("🔔 Webhook Status: " + payment.getStatus());

            if ("approved".equals(payment.getStatus())) {
                String reference = payment.getExternalReference();

                if (reference != null && reference.contains("__")) {
                    String[] parts = reference.split("__");
                    String userIdStr = parts[0];
                    String courseIdStr = parts[1];

                    liberarCursoNoBanco(userIdStr, courseIdStr);
                }
            }
        } catch (Exception e) {
            System.err.println("❌ Erro no Webhook: " + e.getMessage());
        }
    }

    // Método auxiliar CORRIGIDO
    private void liberarCursoNoBanco(String userIdStr, String courseIdStr) {
        try {
            // Converte String para UUID (Essencial se seu banco usa UUID)
            UUID userId = UUID.fromString(userIdStr);
            UUID courseId = UUID.fromString(courseIdStr);

            User user = userRepository.findById(userId).orElse(null);
            Course course = courseRepository.findById(courseId).orElse(null);

            if (user != null && course != null) {
                boolean jaTem = enrollmentRepository.existsByUserAndCourse(user, course);

                if (!jaTem) {
                    // Builder com os nomes corretos da Entidade
                    Enrollment enrollment = Enrollment.builder()
                            .user(user)
                            .course(course)
                            .enrolledAt(LocalDateTime.now())
                            .progress(0.0)
                            .build();

                    enrollmentRepository.save(enrollment);
                    System.out.println("🎉 SUCESSO! Curso " + course.getTitle() + " liberado para " + user.getName());
                } else {
                    System.out.println("⚠️ Usuário já tinha esse curso.");
                }
            }
        } catch (Exception e) {
            System.err.println("❌ Erro ao salvar matrícula: " + e.getMessage());
            e.printStackTrace();
        }
    }
}