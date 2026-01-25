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
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(authorize -> authorize
                        // 1. RECURSOS VISUAIS (HTML, CSS, JS, IMAGENS) -> LIBERAR TUDO 🟢
                        // Se não liberar aqui, o navegador toma erro 403 ao tentar abrir a página.
                        .requestMatchers(
                                "/js/**", "/css/**", "/images/**", "/assets/**", "/favicon.ico",
                                "/", "/index.html", "/auth/**", "/components/**"
                        ).permitAll()

                        // LIBERA AS PASTAS DE PÁGINAS (O HTML é público, o DADO dentro dele é privado)
                        .requestMatchers("/admin/**").permitAll()
                        .requestMatchers("/aluno/**").permitAll()

                        // 2. ENDPOINTS PÚBLICOS (DADOS) 🟢
                        .requestMatchers(HttpMethod.POST, "/auth/login", "/auth/register").permitAll()
                        .requestMatchers(HttpMethod.GET, "/courses", "/courses/**").permitAll() // Vitrine
                        .requestMatchers("/payments/**", "/webhook/**").permitAll()

                        // 3. SEGURANÇA FORTE (AQUI PROTEGEMOS OS DADOS) 🔒🔴

                        // API do Dashboard Admin (Só Admin vê os números)
                        .requestMatchers("/admin/dashboard/**").hasRole("ADMIN")

                        // Operações de Cursos (Criar/Editar/Deletar) -> Só Admin
                        .requestMatchers(HttpMethod.POST, "/courses/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/courses/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/courses/**").hasRole("ADMIN")

                        // "Botão Mágico" de liberar curso -> Só Admin
                        .requestMatchers("/enrollments/free-pass/**").hasRole("ADMIN")

                        // Dados do Aluno (Meus Cursos) -> Precisa estar logado
                        .requestMatchers("/enrollments/**").authenticated()
                        .requestMatchers("/users/**").authenticated()

                        // 4. TODO O RESTO -> BLOQUEAR SE NÃO TIVER TOKEN
                        .anyRequest().authenticated()
                )
                .addFilterBefore(securityFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
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