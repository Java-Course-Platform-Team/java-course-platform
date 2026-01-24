package com.courseplatform.backend.service;

import com.courseplatform.backend.dto.PaymentDTO;
import com.courseplatform.backend.entity.User;
import com.mercadopago.MercadoPagoConfig;
import com.mercadopago.client.common.IdentificationRequest;
import com.mercadopago.client.payment.PaymentClient;
import com.mercadopago.client.payment.PaymentCreateRequest;
import com.mercadopago.client.payment.PaymentPayerRequest;
import com.mercadopago.resources.payment.Payment;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class PaymentService {

    @Value("${mercadopago.access_token}")
    private String accessToken;

    public PaymentDTO createPayment(User user, BigDecimal amount, String description) {
        try {
            MercadoPagoConfig.setAccessToken(accessToken);

            PaymentClient client = new PaymentClient();

            // Configuração do Pagador (Payer)
            // REMOVIDO: Identificação/CPF para evitar erro de compilação,
            // já que o campo não existe mais na entidade User.
            PaymentPayerRequest payer = PaymentPayerRequest.builder()
                    .email(user.getEmail())
                    .firstName(user.getName())
                    .build();

            PaymentCreateRequest paymentCreateRequest = PaymentCreateRequest.builder()
                    .transactionAmount(amount)
                    .description(description)
                    .paymentMethodId("pix") // Padrão PIX
                    .payer(payer)
                    .build();

            Payment payment = client.create(paymentCreateRequest);

            return new PaymentDTO(
                    payment.getId().toString(),
                    payment.getStatus(),
                    payment.PointOfInteraction().TransactionData().QrCode(),
                    payment.PointOfInteraction().TransactionData().QrCodeBase64()
            );

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Erro ao processar pagamento: " + e.getMessage());
        }
    }
}