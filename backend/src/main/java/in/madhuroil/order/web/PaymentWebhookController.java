package in.madhuroil.order.web;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import in.madhuroil.order.service.OrderService;
import in.madhuroil.payment.RazorpayService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Razorpay POSTs here on payment.captured / payment.failed / etc. Configure
 * this URL (https://your-domain/api/payments/webhook) and app.razorpay.webhook-secret
 * in the Razorpay dashboard. Authenticated by HMAC signature, not a JWT —
 * see SecurityConfig, this path is permitAll and trusts verifyWebhookSignature instead.
 */
@Slf4j
@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentWebhookController {

    private final RazorpayService razorpay;
    private final OrderService orders;
    private final ObjectMapper mapper = new ObjectMapper();

    @PostMapping("/webhook")
    public ResponseEntity<String> webhook(@RequestBody String rawBody,
                                          @RequestHeader("X-Razorpay-Signature") String signature) {
        if (!razorpay.verifyWebhookSignature(rawBody, signature)) {
            log.warn("Rejected webhook call with an invalid signature");
            return ResponseEntity.status(401).body("invalid signature");
        }

        try {
            JsonNode payload = mapper.readTree(rawBody);
            String event = payload.path("event").asText(null);
            JsonNode entity = payload.path("payload").path("payment").path("entity");

            if (!entity.isMissingNode()) {
                String razorpayOrderId = entity.path("order_id").asText(null);
                String razorpayPaymentId = entity.path("id").asText(null);
                orders.handleWebhookEvent(event, razorpayOrderId, razorpayPaymentId);
            }
        } catch (Exception e) {
            log.error("Could not parse Razorpay webhook payload", e);
            return ResponseEntity.badRequest().body("malformed payload");
        }
        return ResponseEntity.ok("ok");
    }
}
