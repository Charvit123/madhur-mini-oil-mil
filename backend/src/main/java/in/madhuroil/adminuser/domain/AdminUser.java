package in.madhuroil.adminuser.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import java.time.Instant;
import java.util.UUID;

/**
 * A named mill-staff login — deliberately not a self-service signup. There
 * are only ever a handful of these (the family and whoever runs the floor),
 * created by an existing SUPER_ADMIN through AdminUserController, or seeded
 * directly in a migration for the first account.
 */
@Entity
@Table(name = "admin_user", indexes = @Index(name = "ix_admin_username", columnList = "username", unique = true))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AdminUser {

    /** ADMIN: normal day-to-day operations access. SUPER_ADMIN: everything
     *  ADMIN has, plus the ability to create/deactivate other admin logins. */
    public enum Role { ADMIN, SUPER_ADMIN }

    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotBlank @Column(nullable = false, unique = true, length = 60)
    private String username;

    @NotBlank @Column(name = "password_hash", nullable = false, length = 100)
    private String passwordHash;

    @Column(name = "full_name", length = 120)
    private String fullName;

    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20)
    private Role role = Role.ADMIN;

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "last_login_at")
    private Instant lastLoginAt;
}
