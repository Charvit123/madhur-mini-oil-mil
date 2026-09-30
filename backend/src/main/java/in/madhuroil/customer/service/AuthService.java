package in.madhuroil.customer.service;

import in.madhuroil.customer.domain.Customer;
import in.madhuroil.customer.domain.OtpToken;
import in.madhuroil.customer.dto.CustomerDtos.*;
import in.madhuroil.customer.repo.*;
import in.madhuroil.config.JwtIssuer;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final Duration OTP_TTL = Duration.ofMinutes(5);
    private static final Duration TOKEN_TTL = Duration.ofDays(30);
    private static final int MAX_ATTEMPTS = 5;

    private final CustomerRepo customers;
    private final OtpTokenRepo otpTokens;
    private final SmsSender sms;
    private final JwtIssuer jwt;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
    private final SecureRandom random = new SecureRandom();

    @Transactional
    public void requestOtp(String phone) {
        String code = String.format("%06d", random.nextInt(1_000_000));
        OtpToken token = OtpToken.builder()
                .phone(phone)
                .codeHash(encoder.encode(code))
                .expiresAt(Instant.now().plus(OTP_TTL))
                .build();
        otpTokens.save(token);
        sms.sendOtp(phone, code);
    }

    @Transactional
    public AuthResponse verifyOtp(String phone, String code) {
        OtpToken token = otpTokens.findFirstByPhoneAndConsumedFalseOrderByCreatedAtDesc(phone)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Request a new code first"));

        if (token.getExpiresAt().isBefore(Instant.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "That code has expired, request a new one");
        }
        if (token.getAttemptCount() >= MAX_ATTEMPTS) {
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "Too many attempts, request a new code");
        }
        token.setAttemptCount(token.getAttemptCount() + 1);

        if (!encoder.matches(code, token.getCodeHash())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Incorrect code");
        }
        token.setConsumed(true);

        Customer customer = customers.findByPhone(phone).orElseGet(() ->
                customers.save(Customer.builder().phone(phone).phoneVerified(true).build()));
        if (!customer.isPhoneVerified()) {
            customer.setPhoneVerified(true);
        }

        String jwtToken = jwt.issue(customer.getId().toString(), List.of("CUSTOMER"), TOKEN_TTL);
        return new AuthResponse(jwtToken, toDto(customer));
    }

    private CustomerDto toDto(Customer c) {
        return new CustomerDto(c.getId(), c.getPhone(), c.getName(), c.getEmail(), c.isPhoneVerified());
    }
}
