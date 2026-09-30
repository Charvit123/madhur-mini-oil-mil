package in.madhuroil.config;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.oauth2.server.resource.OAuth2ResourceServerConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * Spring Security 6/7 style: one SecurityFilterChain bean, lambda DSL, no
 * WebSecurityConfigurerAdapter (removed since 5.7). The JwtDecoder it plugs
 * into oauth2ResourceServer().jwt() comes from JwtConfig — a locally signed
 * HS256 key, not an external IdP — so this whole backend runs standalone.
 *
 * @EnableMethodSecurity turns on @PreAuthorize on the controllers that use
 * it (AdminUserController, and any other admin subcontroller) — previously
 * present in the code but inert without this annotation. The URL-pattern
 * rules below are still the primary enforcement; @PreAuthorize is a second,
 * belt-and-suspenders layer at the method level for the routes that carry it.
 *
 * Route map:
 *  - /api/catalogue/**        public reads
 *  - /api/auth/**             public: OTP request/verify for customers
 *  - /api/admin/auth/login    public: admin sign-in, issues an admin token
 *  - /api/payments/webhook    public: Razorpay signs the payload itself,
 *                              so this is verified by signature, not a JWT
 *  - /api/admin/admins/**     ROLE_SUPER_ADMIN only — creating/deactivating
 *                              other admin logins is not a regular ADMIN's job
 *  - POST /api/orders                    public — guest checkout by design;
 *                              OrderService links the order to a Customer
 *                              record by phone either way (see resolveCustomer)
 *  - GET  /api/orders/{id}               public — the confirmation page reads
 *                              this right after a guest places an order,
 *                              with no login step in between
 *  - GET  /api/orders/by-number/**       public, same reason
 *  - POST /api/orders/{id}/verify-payment  public — called immediately after
 *                              a guest's Razorpay payment succeeds
 *  - GET  /api/orders/mine               authenticated — needs a real
 *                              customer id from the JWT subject
 *  - /api/account/**          ROLE_CUSTOMER
 *  - /api/admin/**            ROLE_ADMIN (except the login route above)
 */
@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    @Profile("!dev")
    public SecurityFilterChain filterChain(
            HttpSecurity http,
            @Qualifier("corsConfigurationSource") CorsConfigurationSource corsSource) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsSource))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/catalogue/**").permitAll()
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/admin/auth/login").permitAll()
                .requestMatchers("/api/payments/webhook").permitAll()
                .requestMatchers("/actuator/health/**", "/actuator/info").permitAll()
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                // Checked before the general /api/admin/** rule below, same
                // reason as /api/orders/mine further down: it's a more
                // specific pattern that the broader one would also match.
                .requestMatchers("/api/admin/admins/**").hasRole("SUPER_ADMIN")
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/account/**").hasRole("CUSTOMER")
                // Order of these matters: /api/orders/mine is checked before
                // the broader GET /api/orders/* pattern below, which would
                // otherwise match it too (both are one path segment deep).
                .requestMatchers("/api/orders/mine").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/orders").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/orders/by-number/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/orders/*/verify-payment").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/orders/*").permitAll()
                .requestMatchers("/api/orders/**").authenticated()
                .anyRequest().authenticated())
            .oauth2ResourceServer(OAuth2ResourceServerConfigurer::jwt);
        return http.build();
    }

    /** Dev escape hatch — everything open so the frontend can be built against
     *  this API before any auth UI exists. Matches application-dev.yml. */
    @Bean
    @Profile("dev")
    public SecurityFilterChain devFilterChain(
            HttpSecurity http,
            @Qualifier("corsConfigurationSource") CorsConfigurationSource corsSource) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsSource))
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth.anyRequest().permitAll());
        return http.build();
    }

    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        var authorities = new JwtGrantedAuthoritiesConverter();
        authorities.setAuthoritiesClaimName("roles");
        authorities.setAuthorityPrefix("ROLE_");
        var converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(authorities);
        return converter;
    }

    /** The Next.js dev server runs on a different origin, so this needs to be
     *  explicit. The 192.168.x.x, 10.x.x.x and 172.16-31.x.x patterns cover
     *  testing from a phone or another machine on a typical home/office LAN
     *  out of the box —
     *  e.g. opening the frontend at http://192.168.1.13:3000 and having its
     *  browser-side requests reach this API. Set app.cors.allowed-origin to
     *  one or more comma-separated origins (your deployed frontend's URL,
     *  or a specific LAN address) to add more; it's additive, not a replacement. */
    @Bean
    public CorsConfigurationSource corsConfigurationSource(
            @Value("${app.cors.allowed-origin:}") String extraOrigins) {
        CorsConfiguration config = new CorsConfiguration();
        var patterns = new java.util.ArrayList<>(List.of(
                "http://localhost:*",
                "http://127.0.0.1:*",
                "http://192.168.*.*:*",
                "http://10.*.*.*:*",
                "http://172.16.*.*:*", "http://172.17.*.*:*", "http://172.18.*.*:*", "http://172.19.*.*:*",
                "http://172.2*.*.*:*", "http://172.30.*.*:*", "http://172.31.*.*:*",
                "https://*.vercel.app"));
        for (String origin : extraOrigins.split(",")) {
            if (!origin.isBlank()) patterns.add(origin.trim());
        }
        config.setAllowedOriginPatterns(patterns);
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
