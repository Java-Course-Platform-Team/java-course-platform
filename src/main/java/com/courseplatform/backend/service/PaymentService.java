package com.courseplatform.backend.service;

import com.courseplatform.backend.entity.Course;
import com.courseplatform.backend.entity.User;
import com.courseplatform.backend.repository.CourseRepository;
import com.courseplatform.backend.repository.UserRepository;
import com.mercadopago.MercadoPagoConfig;
import com.mercadopago.client.common.IdentificationRequest;
import com.mercadopago.client.payment.PaymentClient;
import com.mercadopago.client.preference.*;
import com.mercadopago.exceptions.MPApiException;
import com.mercadopago.resources.payment.Payment;
import com.mercadopago.resources.preference.Preference;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import jakarta.annotation.PostConstruct;

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

    @PostConstruct
    public void init() {
        // Inicializa o motor com o seu token oficial
        MercadoPagoConfig.setAccessToken(accessToken);
    }

    public String createPaymentLink(Course course, User user) {
        try {
            // 1. LIMPEZA TOTAL DE CPF (O MP só aceita números puros)
            String cpfNumerico = user.getCpf().replaceAll("\\D", "");

            // 2. CONFIGURAÇÃO DO ITEM
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

            // 3. CONFIGURAÇÃO DO PAGADOR (Payer)
            PreferencePayerRequest payerRequest = PreferencePayerRequest.builder()
                    .name(user.getName())
                    .email(user.getEmail())
                    .identification(
                            IdentificationRequest.builder()
                                    .type("CPF")
                                    .number(cpfNumerico)
                                    .build()
                    )
                    .build();

            // 4. URLs DE RETORNO (Corrigindo o erro 'must be defined')
            // Removido o localhost:8081 para evitar bloqueios de segurança do MP em ambiente de teste
            PreferenceBackUrlsRequest backUrls = PreferenceBackUrlsRequest.builder()
                    .success("https://www.google.com") // URL temporária para teste de sucesso
                    .pending("https://www.google.com")
                    .failure("https://www.google.com")
                    .build();

            // 5. CONSTRUÇÃO DA PREFERÊNCIA
            PreferenceRequest preferenceRequest = PreferenceRequest.builder()
                    .items(items)
                    .payer(payerRequest)
                    .backUrls(backUrls)
                    // NOTA: Desativei o autoReturn para o MP não travar na validação da URL
                    .externalReference(course.getId() + "_" + user.getId())
                    .statementDescriptor("ODONTOPRO")
                    .build();

            PreferenceClient client = new PreferenceClient();

            try {
                Preference preference = client.create(preferenceRequest);
                System.out.println("✅ Link gerado com sucesso para o curso: " + course.getTitle());
                return preference.getInitPoint();
            } catch (MPApiException e) {
                // Aqui o senhor verá o motivo exato se houver outra rejeição
                System.err.println("❌ ERRO API MERCADO PAGO: " + e.getApiResponse().getContent());
                throw new RuntimeException("Erro na API do Mercado Pago.");
            }

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Erro ao criar link de pagamento.");
        }
    }

    public void processPaymentNotification(Long paymentId) {
        // Mantive a lógica de processamento original do Felipe
        try {
            PaymentClient client = new PaymentClient();
            Payment payment = client.get(paymentId);
            String status = payment.getStatus();

            if ("approved".equals(status)) {
                String externalRef = payment.getExternalReference();
                if (externalRef != null) {
                    String[] parts = externalRef.split("_");
                    Long courseId = Long.parseLong(parts[0]);
                    UUID userId = UUID.fromString(parts[1]);

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