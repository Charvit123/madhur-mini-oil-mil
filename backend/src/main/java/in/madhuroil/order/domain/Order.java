package in.madhuroil.order.domain;

import in.madhuroil.customer.domain.Customer;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;

/**
 * Everything money-related is computed and stored server-side at creation
 * time (see OrderService#createOrder) and never re-derived from the cart the
 * client sent — the client's prices are a display convenience only.
 */
@Entity
@Table(name = "orders", indexes = @Index(name = "ix_order_number", columnList = "order_number", unique = true))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Order {

    public enum Status { PENDING_PAYMENT, PAID, PACKED, DISPATCHED, DELIVERED, CANCELLED, PAYMENT_FAILED, REFUNDED }
    public enum DeliveryMethod { STANDARD, MILL_PICKUP }
    public enum PaymentMethod { UPI, CARD, NETBANKING, COD }

    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    /** Human-facing, e.g. MDH-24817. Sequential-looking but generated from a DB sequence, not guessable order-to-order. */
    @NotBlank @Column(name = "order_number", nullable = false, unique = true, length = 20)
    private String orderNumber;

    /** Nullable: guest checkout is supported, keyed by phone on the order itself. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @NotBlank @Column(nullable = false, length = 120) private String contactName;
    @NotBlank @Column(nullable = false, length = 10) private String contactPhone;
    @Column(length = 160) private String contactEmail;

    // Address is snapshotted onto the order, not a live FK, so editing a saved
    // address later never rewrites history for orders already placed.
    @Column(name = "ship_line1", nullable = false, length = 240) private String shipLine1;
    @Column(name = "ship_line2", length = 240) private String shipLine2;
    @Column(name = "ship_city", nullable = false, length = 100) private String shipCity;
    @Column(name = "ship_state", nullable = false, length = 100) private String shipState;
    @Column(name = "ship_pincode", nullable = false, length = 6) private String shipPincode;

    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20) private DeliveryMethod deliveryMethod = DeliveryMethod.STANDARD;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20) private PaymentMethod paymentMethod;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20) private Status status = Status.PENDING_PAYMENT;

    @Column(nullable = false, precision = 10, scale = 2) private BigDecimal subtotal;
    @Column(name = "shipping_fee", nullable = false, precision = 10, scale = 2) private BigDecimal shippingFee;
    // Not coupon-driven — discounting happens at the catalogue level (each
    // ProductVariant's price vs mrp). This stays as a plain admin-settable
    // amount for the rare manual adjustment, defaulting to zero.
    @Column(name = "discount_amount", nullable = false, precision = 10, scale = 2) private BigDecimal discountAmount = BigDecimal.ZERO;
    @Column(nullable = false, precision = 10, scale = 2) private BigDecimal total;

    @Column(name = "razorpay_order_id", length = 60) private String razorpayOrderId;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<OrderItem> items = new ArrayList<>();

    @Column(name = "placed_at", nullable = false, updatable = false) private Instant placedAt = Instant.now();
    @Column(name = "updated_at", nullable = false) private Instant updatedAt = Instant.now();
    @PreUpdate void touch() { this.updatedAt = Instant.now(); }
}
