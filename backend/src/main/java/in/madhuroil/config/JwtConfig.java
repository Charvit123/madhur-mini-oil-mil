package in.madhuroil.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;

import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;

/**
 * Self-contained JWT: tokens are signed and verified with one shared secret
 * (app.jwt.secret), not against an external IdP's JWKS endpoint. This is what
 * lets the whole backend run with `docker compose up && ./mvnw spring-boot:run`
 * and nothing else — no Auth0/Keycloak/Cognito account required to try it.
 *
 * JwtIssuer (below) signs with this exact key using the same HS256 algorithm
 * this decoder expects, so a token minted by AuthService or the admin login
 * endpoint is immediately valid against SecurityConfig's resource server.
 *
 * For production, swapping this for a real IdP means: delete this class,
 * delete JwtIssuer, and set spring.security.oauth2.resourceserver.jwt.issuer-uri
 * instead — SecurityConfig's authorizeHttpRequests rules don't change at all.
 */
@Configuration
public class JwtConfig {

    @Bean
    public SecretKeySpec jwtSigningKey(@Value("${app.jwt.secret}") String secret) {
        byte[] bytes = secret.getBytes(StandardCharsets.UTF_8);
        if (bytes.length < 32) {
            throw new IllegalStateException(
                "app.jwt.secret must be at least 32 bytes for HS256 — set a longer JWT_SECRET env var.");
        }
        return new SecretKeySpec(bytes, "HmacSHA256");
    }

    @Bean
    public JwtDecoder jwtDecoder(SecretKeySpec jwtSigningKey) {
        return NimbusJwtDecoder.withSecretKey(jwtSigningKey)
                .macAlgorithm(org.springframework.security.oauth2.jose.jws.MacAlgorithm.HS256)
                .build();
    }
}
