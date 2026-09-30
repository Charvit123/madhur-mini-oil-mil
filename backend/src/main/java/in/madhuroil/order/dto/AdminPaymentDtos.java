package in.madhuroil.order.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@JsonInclude(JsonInclude.Include.NON_NULL)
public final class AdminPaymentDtos {

    /** Read-only by design — a payment record is a fact about what Razorpay
     *  did, not something an admin edits from here. Refunding happens on the
     *  Orders screen (adminRefund), which is the one action allowed to change
     *  a payment's state, and it goes through Razorpay itself, not a raw edit. */
    public record AdminPaymentDto(
            UUID id, UUID orderId, String orderNumber, String customerName,
            String razorpayPaymentId, String status, BigDecimal amount, String method,
            BigDecimal refundedAmount, Instant createdAt) {}

    private AdminPaymentDtos() {}
}
