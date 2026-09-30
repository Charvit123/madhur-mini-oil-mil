package in.madhuroil.customer.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;

/**
 * Short-lived login code. request() stores a fresh row, verify() consumes it.
 * AuthService logs the code to the console in dev instead of sending a real
 * SMS — swap DevSmsSender for a real MSG91 / Twilio client in production
 * (see AuthService's `SmsSender` interface).
 */
@Entity
@Table(name = "otp_token", indexes = @Index(name = "ix_otp_phone", columnList = "phone"))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class OtpToken {

    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 10) private String phone;
    @Column(name = "code_hash", nullable = false, length = 100) private String codeHash;
    @Column(name = "expires_at", nullable = false) private Instant expiresAt;
    @Column(nullable = false) private boolean consumed = false;
    @Column(name = "attempt_count", nullable = false) private int attemptCount = 0;
    @Column(name = "created_at", nullable = false, updatable = false) private Instant createdAt = Instant.now();
}
