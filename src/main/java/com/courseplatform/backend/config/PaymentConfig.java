package com.courseplatform.backend.config;
import com.mercadopago.MercadoPagoConfig;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class PaymentConfig {

    @Value("${mercadopago.access_token}")
    private String accessToken;

    @PostConstruct
    public void init() {
        // 👇 AQUI: Tem que chamar "MercadoPagoConfig" (da biblioteca)
        MercadoPagoConfig.setAccessToken(accessToken);

        System.out.println("⚠️ Mercado Pago rodando com Token Provisório!");
    }
}