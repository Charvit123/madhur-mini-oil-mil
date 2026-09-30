package in.madhuroil.order.service;

import org.springframework.stereotype.Component;
import java.security.SecureRandom;

/** MDH-24817 style: short enough to say over the phone, not sequential enough to guess a neighbour's order. */
@Component
public class OrderNumberGenerator {
    private final SecureRandom random = new SecureRandom();
    public String next() {
        return "MDH-" + (10000 + random.nextInt(90000));
    }
}
