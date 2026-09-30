package in.madhuroil.order.domain;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * One row per Razorpay payment attempt against an order. An order can have
 * more than one row if a first attempt failed and the customer retried —
 * that history is exactly what the admin Payments screen shows.
 */
@Entity
@Table(name = "payment")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Payment {

    public enum Status { CREATED, AUTHORIZED, CAPTURED, FAILED, REFUNDED }

    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "order_id", nullable = false) private UUID orderId;

    @Column(name = "razorpay_order_id", nullable = false, length = 60) private String razorpayOrderId;
    @Column(name = "razorpay_payment_id", length = 60) private String razorpayPaymentId;
    @Column(name = "razorpay_signature", length = 200) private String razorpaySignature;

    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20) private Status status;
    @Column(nullable = false, precision = 10, scale = 2) private BigDecimal amount;
    @Column(length = 20) private String method;              // upi / card / netbanking / cod
    @Column(name = "failure_reason", length = 300) private String failureReason;

    // Set once OrderService#adminRefund issues a refund through Razorpay.
    @Column(name = "refunded_amount", precision = 10, scale = 2) private BigDecimal refundedAmount;
    @Column(name = "razorpay_refund_id", length = 60) private String razorpayRefundId;

    @Column(name = "created_at", nullable = false, updatable = false) private Instant createdAt = Instant.now();
    @Column(name = "updated_at", nullable = false) private Instant updatedAt = Instant.now();
    @PreUpdate void touch() { this.updatedAt = Instant.now(); }
}
