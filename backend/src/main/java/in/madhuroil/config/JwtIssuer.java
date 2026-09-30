package in.madhuroil.config;

import io.jsonwebtoken.Jwts;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.spec.SecretKeySpec;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import java.util.List;

/**
 * The other half of JwtConfig: mints tokens that its JwtDecoder can verify.
 * Written against jjwt 0.12's current builder API (subject()/issuer()/claim(),
 * not the pre-0.12 setSubject()/setIssuer() style).
 */
@Component
public class JwtIssuer {

    private final SecretKeySpec key;
    private final String issuer;

    public JwtIssuer(SecretKeySpec jwtSigningKey, @Value("${spring.application.name}") String issuer) {
        this.key = jwtSigningKey;
        this.issuer = issuer;
    }

    /** subject = customer id, or "admin:<username>"; roles becomes the "roles" claim SecurityConfig's converter reads. */
    public String issue(String subject, List<String> roles, Duration ttl) {
        Instant now = Instant.now();
        return Jwts.builder()
                .issuer(issuer)
                .subject(subject)
                .claim("roles", roles)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plus(ttl)))
                .signWith(key)
                .compact();
    }
}
