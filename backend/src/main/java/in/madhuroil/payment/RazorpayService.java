package in.madhuroil.payment;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;

/**
 * Talks to Razorpay's REST API directly (HTTPS + Basic Auth) rather than the
 * razorpay-java SDK. Only two things about Razorpay's contract are used here,
 * both documented and stable:
 *   - POST /v1/orders (amount in paise) -> {"id": "order_...", ...}
 *   - signature = HMAC-SHA256(payload, secret), hex-encoded
 * That second part covers both payment verification (payload is
 * "{order_id}|{payment_id}") and webhook verification (payload is the raw
 * request body) — same primitive, different input.
 */
@Service
@RequiredArgsConstructor
public class RazorpayService {

    private final RestClient razorpayRestClient;
    private final ObjectMapper mapper = new ObjectMapper();

    @Value("${app.razorpay.key-id}")
    private String keyId;

    @Value("${app.razorpay.key-secret}")
    private String keySecret;

    @Value("${app.razorpay.webhook-secret:}")
    private String webhookSecret;

    public record CreatedOrder(String razorpayOrderId, long amountPaise, String currency) {}

    public CreatedOrder createOrder(String receipt, BigDecimal amountInRupees) {
        long paise = convertToPaise(amountInRupees);
        ObjectNode body = mapper.createObjectNode();
        body.put("amount", paise);
        body.put("currency", "INR");
        body.put("receipt", receipt);
        body.put("payment_capture", 1);

        try {
            String response = razorpayRestClient.post()
                    .uri("/orders")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body.toString())
                    .retrieve()
                    .body(String.class);

            JsonNode json = mapper.readTree(response);
            return new CreatedOrder(json.get("id").asText(), paise, json.path("currency").asText("INR"));
        } catch (RestClientResponseException e) {
            throw new PaymentGatewayException(
                    "Razorpay rejected the order request: " + e.getResponseBodyAsString(), e);
        } catch (Exception e) {
            throw new PaymentGatewayException("Could not reach Razorpay", e);
        }
    }

    public record RefundResult(String razorpayRefundId, String status) {}

    /**
     * POST /v1/payments/{id}/refund — a full refund of the given amount back
     * to whatever method the customer paid with. Razorpay handles routing
     * the money back (UPI, card, netbanking); this call just asks for it and
     * gets a refund id and status back. Idempotent on Razorpay's side per
     * their own docs for the same payment, but OrderService still only calls
     * this once per order (guarded by Order.Status.REFUNDED check).
     */
    public RefundResult refundPayment(String razorpayPaymentId, long amountPaise) {
        ObjectNode body = mapper.createObjectNode();
        body.put("amount", amountPaise);
        body.put("speed", "normal");

        try {
            String response = razorpayRestClient.post()
                    .uri("/payments/{id}/refund", razorpayPaymentId)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body.toString())
                    .retrieve()
                    .body(String.class);

            JsonNode json = mapper.readTree(response);
            return new RefundResult(json.get("id").asText(), json.path("status").asText("processed"));
        } catch (RestClientResponseException e) {
            throw new PaymentGatewayException(
                    "Razorpay rejected the refund request: " + e.getResponseBodyAsString(), e);
        } catch (Exception e) {
            throw new PaymentGatewayException("Could not reach Razorpay to process the refund", e);
        }
    }

    /** Verifies the signature Razorpay Checkout's success handler returns. */
    public boolean verifyPaymentSignature(String razorpayOrderId, String razorpayPaymentId, String signature) {
        return hmacMatches(razorpayOrderId + "|" + razorpayPaymentId, signature, keySecret);
    }

    /** Verifies the X-Razorpay-Signature header on incoming webhook POSTs. */
    public boolean verifyWebhookSignature(String rawPayload, String signature) {
        if (webhookSecret == null || webhookSecret.isBlank()) return false;
        return hmacMatches(rawPayload, signature, webhookSecret);
    }

    public String publicKeyId() { return keyId; }

    private boolean hmacMatches(String payload, String signature, String secret) {
        if (signature == null || signature.isBlank()) return false;
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] hash = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            String computed = HexFormat.of().formatHex(hash);
            // Constant-time compare — a timing side-channel here would leak the correct signature byte by byte.
            return MessageDigest.isEqual(
                    computed.getBytes(StandardCharsets.UTF_8),
                    signature.getBytes(StandardCharsets.UTF_8));
        } catch (Exception e) {
            return false;
        }
    }

    private long convertToPaise(BigDecimal rupees) {
        return rupees.multiply(BigDecimal.valueOf(100)).setScale(0, RoundingMode.HALF_UP).longValueExact();
    }

    public static class PaymentGatewayException extends RuntimeException {
        public PaymentGatewayException(String message, Throwable cause) { super(message, cause); }
    }
}
