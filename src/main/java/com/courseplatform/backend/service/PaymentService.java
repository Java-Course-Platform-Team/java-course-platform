package com.courseplatform.backend.service;

import com.courseplatform.backend.entity.Course;
import com.courseplatform.backend.entity.User;
import com.courseplatform.backend.repository.CourseRepository;
import com.courseplatform.backend.repository.UserRepository;
import com.mercadopago.MercadoPagoConfig;
import com.mercadopago.client.common.IdentificationRequest;
import com.mercadopago.client.preference.*;
import com.mercadopago.exceptions.MPApiException;
import com.mercadopago.resources.payment.Payment;
import com.mercadopago.resources.preference.Preference;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import com.mercadopago.client.payment.PaymentClient;

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

    @Value("${mercadopago.access_token}")
    private String accessToken;

    // Inicializa o Mercado Pago assim que o app liga
    @PostConstruct
    public void init() {
        MercadoPagoConfig.setAccessToken(accessToken);
    }

    // MÉTODO 1: GERA O LINK (IDA)
    public String createPaymentLink(Course course, User user) {
        try {
            // 1. LIMPEZA DE CPF (O MP só aceita números puros)
            String cpfNumerico = (user.getCpf() != null) ? user.getCpf().replaceAll("\\D", "") : "";

            // 2. CONFIGURAÇÃO DO ITEM
            PreferenceItemRequest itemRequest = PreferenceItemRequest.builder()
                    .id(course.getId().toString())
                    .title(course.getTitle())
                    .description("Curso na OdontoPro")
                    .pictureUrl(course.getImageUrl())
                    .quantity(1)
                    .currencyId("BRL")
                    .unitPrice(course.getPrice())
                    .build();

            List<PreferenceItemRequest> items = new ArrayList<>();
            items.add(itemRequest);

            // 3. CONFIGURAÇÃO DO PAGADOR
            PreferencePayerRequest payerRequest = PreferencePayerRequest.builder()
                    .name(user.getName())
                    .email(user.getEmail())
                    .identification(
                            IdentificationRequest.builder()
                                    .type("CPF")
                                    .number(cpfNumerico) // CPF limpo
                                    .build()
                    )
                    .build();

            // 4. URLS DE RETORNO
            PreferenceBackUrlsRequest backUrls = PreferenceBackUrlsRequest.builder()
                    .success("http://localhost:8081/aluno/sucesso.html") // Jhon pode mudar depois
                    .pending("http://localhost:8081/aluno/pendente.html")
                    .failure("http://localhost:8081/aluno/erro.html")
                    .build();

            // 5. PREFERÊNCIA FINAL
            PreferenceRequest preferenceRequest = PreferenceRequest.builder()
                    .items(items)
                    .payer(payerRequest)
                    .backUrls(backUrls)
                    .externalReference(course.getId() + "_" + user.getId()) // course_user
                    .statementDescriptor("ODONTOPRO")
                    .build();

            PreferenceClient client = new PreferenceClient();
            Preference preference = client.create(preferenceRequest);

            return preference.getInitPoint();

        } catch (MPApiException e) {
            System.err.println("❌ ERRO MP: " + e.getApiResponse().getContent());
            throw new RuntimeException("Erro ao gerar link MP: " + e.getMessage());
        } catch (Exception e) {
            throw new RuntimeException("Erro genérico pagamento", e);
        }
    }

    // MÉTODO 2: WEBHOOK (CORRIGIDO PARA UUID)
    public void processPaymentNotification(Long paymentId) {
        try {
            System.out.println("🔔 WEBHOOK: Verificando ID: " + paymentId);

            PaymentClient client = new PaymentClient();
            Payment payment = client.get(paymentId);
            String status = payment.getStatus();

            if ("approved".equals(status)) {
                String externalRef = payment.getExternalReference();
                if (externalRef != null) {
                    String[] parts = externalRef.split("_");
                    UUID courseId = UUID.fromString(parts[0]);
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