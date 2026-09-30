package in.madhuroil.customer.web;

import in.madhuroil.customer.dto.CustomerDtos.*;
import in.madhuroil.customer.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService auth;

    @PostMapping("/otp/request")
    public Map<String, Object> requestOtp(@Valid @RequestBody OtpRequest req) {
        auth.requestOtp(req.phone());
        return Map.of("sent", true, "expiresInSeconds", 300);
    }

    @PostMapping("/otp/verify")
    public AuthResponse verifyOtp(@Valid @RequestBody OtpVerifyRequest req) {
        return auth.verifyOtp(req.phone(), req.code());
    }
}
