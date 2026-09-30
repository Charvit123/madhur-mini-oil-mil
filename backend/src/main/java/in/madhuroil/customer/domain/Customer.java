package in.madhuroil.customer.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.Instant;
import java.util.*;

/**
 * A person who has ordered or logged in. Created on first OTP verification
 * (see AuthService) or, for guest checkout, the first time their phone number
 * appears on an order — either way this table has one row per phone number.
 */
@Entity
@Table(name = "customer", indexes = @Index(name = "ix_customer_phone", columnList = "phone", unique = true))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Customer {

    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotBlank @Pattern(regexp = "^[6-9]\\d{9}$", message = "Enter a 10 digit Indian mobile number")
    @Column(nullable = false, unique = true, length = 10)
    private String phone;

    @Column(length = 120) private String name;
    @Column(length = 160) private String email;

    /** True once they have verified an OTP at least once, vs. a guest record created purely from a checkout. */
    @Column(name = "phone_verified", nullable = false) private boolean phoneVerified = false;

    /** Soft delete — a deactivated customer can no longer sign in, but their
     *  past orders (and any admin note referencing them) stay resolvable. */
    @Column(name = "active", nullable = false) private boolean active = true;

    @Column(name = "created_at", nullable = false, updatable = false) private Instant createdAt = Instant.now();
    @Column(name = "updated_at", nullable = false) private Instant updatedAt = Instant.now();
    @PreUpdate void touch() { this.updatedAt = Instant.now(); }
}
