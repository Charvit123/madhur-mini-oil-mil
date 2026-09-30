package in.madhuroil.order.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@JsonInclude(JsonInclude.Include.NON_NULL)
public final class OrderDtos {

    public record LineItemRequest(@NotNull UUID variantId, @Min(1) int quantity) {}

    /**
     * What the checkout flow posts. Only variantId + quantity travel for
     * pricing — price, mrp and totals are always looked up and recomputed
     * server-side in OrderService, never taken from this payload. No coupon
     * code: discounting happens at the catalogue level (price vs mrp per
     * variant), not through order-level codes.
     */
    public record CreateOrderRequest(
            @NotEmpty @Valid List<LineItemRequest> items,
            @NotBlank String contactName,
            @NotBlank @Pattern(regexp = "^[6-9]\\d{9}$") String contactPhone,
            String contactEmail,
            @NotBlank String shipLine1, String shipLine2,
            @NotBlank String shipCity, @NotBlank String shipState,
            @NotBlank @Pattern(regexp = "^\\d{6}$") String shipPincode,
            @NotNull String deliveryMethod,     // "STANDARD" | "MILL_PICKUP"
            @NotNull String paymentMethod) {}    // "UPI" | "CARD" | "NETBANKING" | "COD"

    public record OrderItemDto(UUID variantId, String sku, String productName, String packagingName,
                               BigDecimal unitPrice, int quantity, BigDecimal lineTotal) {}

    public record OrderDto(
            UUID id, String orderNumber, String status,
            String contactName, String contactPhone, String contactEmail,
            String shipLine1, String shipLine2, String shipCity, String shipState, String shipPincode,
            String deliveryMethod, String paymentMethod,
            BigDecimal subtotal, BigDecimal shippingFee, BigDecimal discountAmount, BigDecimal total,
            List<OrderItemDto> items, Instant placedAt,
            RazorpayCheckoutDto razorpay,
            RefundInfoDto refund) {}

    /** Everything the frontend needs to open Razorpay's checkout widget. */
    public record RazorpayCheckoutDto(String keyId, String razorpayOrderId, long amountPaise, String currency) {}

    public record VerifyPaymentRequest(
            @NotBlank String razorpayOrderId,
            @NotBlank String razorpayPaymentId,
            @NotBlank String razorpaySignature) {}

    public record UpdateOrderStatusRequest(@NotNull String status) {}

    /** Present on an OrderDto once OrderService#adminRefund has run for it. */
    public record RefundInfoDto(BigDecimal refundedAmount, String razorpayRefundId) {}

    private OrderDtos() {}
}
