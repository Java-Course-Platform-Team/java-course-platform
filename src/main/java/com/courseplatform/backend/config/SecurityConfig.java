package com.courseplatform.backend.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired
    private SecurityFilter securityFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(authorize -> authorize
                        // 1. RECURSOS VISUAIS (Liberar tudo)
                        .requestMatchers(
                                "/js/**", "/css/**", "/images/**", "/assets/**", "/favicon.ico",
                                "/", "/index.html", "/auth/**", "/components/**"
                        ).permitAll()

                        // LIBERA AS PÁGINAS HTML
                        .requestMatchers("/admin/**", "/aluno/**").permitAll()

                        // 2. ENDPOINTS PÚBLICOS (Rotas que não exigem login)
                        .requestMatchers(HttpMethod.POST, "/auth/login", "/auth/register").permitAll()
                        .requestMatchers(HttpMethod.GET, "/courses", "/courses/**").permitAll() // A loja pública

                        // ⚠️ ATENÇÃO: O Webhook do Mercado Pago bate AQUI
                        .requestMatchers("/api/webhook", "/webhook").permitAll()

                        // 3. ENDPOINTS PROTEGIDOS (Exigem Login)
                        // Note que adicionamos o "/api/" para casar com seu JavaScript

                        // Pagamento (Checkout)
                        .requestMatchers("/api/payments/**", "/payments/**").authenticated()

                        // Matrículas (Meus Cursos)
                        .requestMatchers("/api/enrollments/**", "/enrollments/**").authenticated()

                        // Usuários
                        .requestMatchers("/users/**").authenticated()

                        // 4. ÁREA ADMINISTRATIVA (Só Admin)
                        .requestMatchers("/admin/dashboard/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/courses/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/courses/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/courses/**").hasRole("ADMIN")
                        .requestMatchers("/enrollments/free-pass/**").hasRole("ADMIN")

                        // 5. RESTO BLOQUEADO
                        .anyRequest().authenticated()
                )
                .addFilterBefore(securityFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("*"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(false);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}