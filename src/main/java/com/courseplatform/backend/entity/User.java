package com.courseplatform.backend.entity;

import com.courseplatform.backend.Role;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "tb_users")
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String name;

    @Column(unique = true) // Garante que não repete email
    private String email;

    // --- ADICIONADO: O CAMPO QUE FALTAVA ---
    private String cpf;
    // ---------------------------------------

    @Column(name = "password_hash")
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    private Role role;

    @Column(name = "avatar_url")
    private String avatarUrl;

    // O campo isActive JÁ EXISTE, perfeito para o banimento!
    @Column(name = "is_active")
    private Boolean isActive = true; // Inicia como true por padrão para evitar NullPointerException

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
        if (isActive == null) isActive = true; // Garante que nunca seja nulo ao criar
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // --- OVERRIDES DO SPRING SECURITY (MANTIDOS) ---

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        if (this.role == Role.ADMIN) return List.of(new SimpleGrantedAuthority("ROLE_ADMIN"), new SimpleGrantedAuthority("ROLE_USER"));
        else return List.of(new SimpleGrantedAuthority("ROLE_USER"));
    }

    @Override
    public String getPassword() {
        return passwordHash;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() { return true; }

    // DICA: Vinculamos o bloqueio ao isActive também. Se banido, a conta trava.
    @Override
    public boolean isAccountNonLocked() {
        return isActive != null ? isActive : true;
    }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() {
        return isActive != null ? isActive : true;
    }
}