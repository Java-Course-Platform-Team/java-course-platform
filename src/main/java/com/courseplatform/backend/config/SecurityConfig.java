package com.courseplatform.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // 1. Desabilita CSRF (Padrão para APIs Stateless/JWT)
                .csrf(AbstractHttpConfigurer::disable)
                // 2. Configura CORS (Para aceitar conexões do Front)
                .cors(org.springframework.security.config.Customizer.withDefaults())

                .authorizeHttpRequests(auth -> auth
                        // 3. Libera Login e Cadastro (Essenciais - POST)
                        .requestMatchers(HttpMethod.POST, "/users", "/auth/login").permitAll()

                        // 4. LIBERA AS TELAS, ARQUIVOS ESTÁTICOS E PÁGINA DE ERRO 🚨
                        .requestMatchers(
                                "/",
                                "/index.html",
                                "/favicon.ico",
                                "/js/**",
                                "/css/**",
                                "/img/**",
                                "/auth/**",        // Tela de Login
                                "/admin/**",       // Tela de Admin (Dashboard HTML)
                                "/aluno/**",       // Tela de Aluno (Meus Cursos HTML)
                                "/components/**",
                                "/fragments/**",
                                "/error"           // <--- ADIÇÃO CRÍTICA: Permite ver mensagens de erro (404/500) sem tomar 403
                        ).permitAll()

                        // 5. BLOQUEIA O RESTO (Endpoints de dados, como /courses)
                        // Isso garante que os dados JSON exijam autenticação
                        .anyRequest().authenticated()
                );

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Libera geral para desenvolvimento local
        configuration.setAllowedOrigins(List.of("*"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}