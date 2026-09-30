package in.madhuroil.customer.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

/** Dev/demo default: prints the OTP to the server console instead of sending a real SMS. */
@Slf4j
@Component
@Profile("dev")
public class DevSmsSender implements SmsSender {
    @Override
    public void sendOtp(String phone, String code) {
        log.info("=== OTP for +91{} is {} (dev mode — no real SMS sent) ===", phone, code);
    }
}
