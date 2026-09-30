package in.madhuroil.order.service;

import in.madhuroil.catalog.domain.ProductVariant;
import in.madhuroil.catalog.repo.ProductVariantRepo;
import in.madhuroil.customer.domain.Customer;
import in.madhuroil.customer.repo.CustomerRepo;
import in.madhuroil.order.domain.Order;
import in.madhuroil.order.domain.OrderItem;
import in.madhuroil.order.domain.Payment;
import in.madhuroil.order.dto.OrderDtos.*;
import in.madhuroil.order.repo.*;
import in.madhuroil.payment.RazorpayService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;

/**
 * Owns money. Every price in an Order/OrderItem is looked up from
 * ProductVariant at creation time — the client's CreateOrderRequest carries
 * only variantId + quantity, never a price, so a tampered cart total is
 * structurally impossible, not just validated away. No coupon system:
 * discounting lives entirely at the catalogue level (price vs mrp per
 * variant); discountAmount here stays available for a rare manual
 * adjustment but nothing computes it automatically.
 */
@Service
@RequiredArgsConstructor
public class OrderService {

    private static final BigDecimal FREE_SHIPPING_OVER = new BigDecimal("1499");
    private static final BigDecimal FLAT_SHIPPING = new BigDecimal("79");
    private static final BigDecimal COD_FEE = new BigDecimal("40");
    /** Orders left in PENDING_PAYMENT this long are treated as abandoned and their stock is released. */
    private static final long ABANDON_AFTER_MINUTES = 30;

    private final OrderRepo orders;
    private final PaymentRepo payments;
    private final ProductVariantRepo variants;
    private final CustomerRepo customers;
    private final RazorpayService razorpay;
    private final OrderNumberGenerator orderNumbers;
    private final OrderMapper mapper;

    @Transactional
    public OrderDto createOrder(CreateOrderRequest req, String authenticatedCustomerId) {
        if (req.items().isEmpty()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cart is empty");

        // 1. Price every line from the database, never from the request.
        List<OrderItem> items = new ArrayList<>();
        BigDecimal subtotal = BigDecimal.ZERO;
        for (var line : req.items()) {
            ProductVariant v = variants.findById(line.variantId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "One of the items is no longer available"));
            if (!v.isActive()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, v.getProduct().getName() + " is no longer available");

            BigDecimal lineTotal = v.getPrice().multiply(BigDecimal.valueOf(line.quantity()));
            subtotal = subtotal.add(lineTotal);
            items.add(OrderItem.builder()
                    .variantId(v.getId()).sku(v.getSku())
                    .productName(v.getProduct().getName()).packagingName(v.getPackaging().getName())
                    .unitPrice(v.getPrice()).quantity(line.quantity()).lineTotal(lineTotal)
                    .build());
        }

        // 2. Reserve stock atomically per line; roll back everything already
        //    reserved in this order if any single line is short (see catch below).
        List<UUID> reserved = new ArrayList<>();
        try {
            for (var line : req.items()) {
                int updated = variants.reserve(line.variantId(), line.quantity());
                if (updated == 0) {
                    throw new ResponseStatusException(HttpStatus.CONFLICT,
                            "Someone else just bought the last of one item — please check quantities and try again");
                }
                reserved.add(line.variantId());
            }
        } catch (ResponseStatusException e) {
            for (int i = 0; i < reserved.size(); i++) {
                variants.reserve(reserved.get(i), -req.items().get(i).quantity()); // give back what we took
            }
            throw e;
        }

        // 3. Shipping, computed here, never trusted from the client.
        Order.DeliveryMethod delivery = Order.DeliveryMethod.valueOf(req.deliveryMethod());
        Order.PaymentMethod paymentMethod = Order.PaymentMethod.valueOf(req.paymentMethod());
        BigDecimal shipping = delivery == Order.DeliveryMethod.MILL_PICKUP || subtotal.compareTo(FREE_SHIPPING_OVER) >= 0
                ? BigDecimal.ZERO : FLAT_SHIPPING;
        if (paymentMethod == Order.PaymentMethod.COD) shipping = shipping.add(COD_FEE);

        BigDecimal total = subtotal.add(shipping).max(BigDecimal.ZERO);

        // 4. Link to a customer record — the authenticated one if logged in,
        //    otherwise find-or-create by phone so guest checkout still gets order history.
        Customer customer = resolveCustomer(authenticatedCustomerId, req.contactPhone(), req.contactName());

        Order order = Order.builder()
                .orderNumber(orderNumbers.next())
                .customer(customer)
                .contactName(req.contactName()).contactPhone(req.contactPhone()).contactEmail(req.contactEmail())
                .shipLine1(req.shipLine1()).shipLine2(req.shipLine2()).shipCity(req.shipCity())
                .shipState(req.shipState()).shipPincode(req.shipPincode())
                .deliveryMethod(delivery).paymentMethod(paymentMethod)
                .status(Order.Status.PENDING_PAYMENT)
                .subtotal(subtotal).shippingFee(shipping).discountAmount(BigDecimal.ZERO).total(total)
                .build();
        items.forEach(i -> i.setOrder(order));
        order.setItems(items);

        // COD skips the payment gateway entirely.
        if (paymentMethod == Order.PaymentMethod.COD) {
            order.setStatus(Order.Status.PAID); // "paid" here means "order confirmed", collected on delivery
            orders.save(order);
            return mapper.toDto(order, null);
        }

        var rzpOrder = razorpay.createOrder(order.getOrderNumber(), total);
        order.setRazorpayOrderId(rzpOrder.razorpayOrderId());
        orders.save(order);

        payments.save(Payment.builder()
                .orderId(order.getId()).razorpayOrderId(rzpOrder.razorpayOrderId())
                .status(Payment.Status.CREATED).amount(total).method(req.paymentMethod().toLowerCase()).build());

        var checkout = new RazorpayCheckoutDto(razorpay.publicKeyId(), rzpOrder.razorpayOrderId(), rzpOrder.amountPaise(), rzpOrder.currency());
        return mapper.toDto(order, checkout);
    }

    @Transactional
    public OrderDto verifyPayment(UUID orderId, VerifyPaymentRequest req) {
        Order order = orders.findById(orderId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No such order"));

        boolean valid = razorpay.verifyPaymentSignature(req.razorpayOrderId(), req.razorpayPaymentId(), req.razorpaySignature());
        Payment payment = payments.findByRazorpayOrderId(req.razorpayOrderId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No payment record for this order"));

        if (!valid) {
            payment.setStatus(Payment.Status.FAILED);
            payment.setFailureReason("Signature verification failed");
            order.setStatus(Order.Status.PAYMENT_FAILED);
            releaseStock(order);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Payment could not be verified");
        }

        payment.setRazorpayPaymentId(req.razorpayPaymentId());
        payment.setRazorpaySignature(req.razorpaySignature());
        payment.setStatus(Payment.Status.CAPTURED);
        order.setStatus(Order.Status.PAID);
        return mapper.toDto(order, null);
    }

    /** Called from the Razorpay webhook — the source of truth if the browser
     *  closes before verifyPayment's client-side call completes. Idempotent:
     *  re-delivered webhooks for an already-CAPTURED payment are a no-op. */
    @Transactional
    public void handleWebhookEvent(String event, String razorpayOrderId, String razorpayPaymentId) {
        Payment payment = payments.findByRazorpayOrderId(razorpayOrderId).orElse(null);
        if (payment == null || payment.getStatus() == Payment.Status.CAPTURED) return;

        Order order = orders.findById(payment.getOrderId()).orElse(null);
        if (order == null) return;

        switch (event) {
            case "payment.captured" -> {
                payment.setStatus(Payment.Status.CAPTURED);
                payment.setRazorpayPaymentId(razorpayPaymentId);
                order.setStatus(Order.Status.PAID);
            }
            case "payment.failed" -> {
                payment.setStatus(Payment.Status.FAILED);
                order.setStatus(Order.Status.PAYMENT_FAILED);
                releaseStock(order);
            }
            default -> { /* ignore other event types */ }
        }
    }

    /**
     * Admin-triggered refund. For a gateway payment (UPI/card/netbanking),
     * this actually calls Razorpay to move the money back — it is not just a
     * status flip. For COD, nothing was ever collected through the gateway,
     * so there's nothing to call; the order is simply marked refunded to
     * reflect a cash refund handled off-system.
     *
     * Stock is deliberately NOT auto-released on refund — a returned tin's
     * condition needs a human to look at it before it goes back on sale.
     * Adjust stock manually via the admin stock endpoint if appropriate.
     */
    @Transactional
    public OrderDto adminRefund(UUID orderId) {
        Order order = orders.findById(orderId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No such order"));

        if (order.getStatus() == Order.Status.REFUNDED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This order has already been refunded");
        }
        if (!REFUNDABLE_STATUSES.contains(order.getStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Only paid, packed, dispatched or delivered orders can be refunded");
        }

        if (order.getPaymentMethod() == Order.PaymentMethod.COD) {
            order.setStatus(Order.Status.REFUNDED);
            return mapper.toDto(order, null, new RefundInfoDto(order.getTotal(), null));
        }

        Payment payment = payments.findByOrderIdOrderByCreatedAtDesc(order.getId()).stream()
                .filter(p -> p.getStatus() == Payment.Status.CAPTURED)
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.CONFLICT, "No captured payment found for this order"));

        long amountPaise = order.getTotal().multiply(BigDecimal.valueOf(100)).setScale(0, RoundingMode.HALF_UP).longValueExact();
        var refund = razorpay.refundPayment(payment.getRazorpayPaymentId(), amountPaise);

        payment.setStatus(Payment.Status.REFUNDED);
        payment.setRefundedAmount(order.getTotal());
        payment.setRazorpayRefundId(refund.razorpayRefundId());
        order.setStatus(Order.Status.REFUNDED);

        return mapper.toDto(order, null, new RefundInfoDto(order.getTotal(), refund.razorpayRefundId()));
    }

    private static final Set<Order.Status> REFUNDABLE_STATUSES = EnumSet.of(
            Order.Status.PAID, Order.Status.PACKED, Order.Status.DISPATCHED, Order.Status.DELIVERED);

    /** Run on a schedule (see OrderCleanupScheduler) to give back stock from
     *  carts that never completed payment. */
    @Transactional
    public int releaseAbandoned() {
        Instant cutoff = Instant.now().minus(ABANDON_AFTER_MINUTES, ChronoUnit.MINUTES);
        List<Order> stuck = orders.findByStatusAndPlacedAtBefore(Order.Status.PENDING_PAYMENT, cutoff);
        for (Order o : stuck) {
            o.setStatus(Order.Status.CANCELLED);
            releaseStock(o);
        }
        return stuck.size();
    }

    private void releaseStock(Order order) {
        for (OrderItem item : order.getItems()) {
            variants.reserve(item.getVariantId(), -item.getQuantity()); // negative qty = give back
        }
    }

    private Customer resolveCustomer(String authenticatedCustomerId, String phone, String name) {
        if (authenticatedCustomerId != null && !authenticatedCustomerId.startsWith("admin:")) {
            try {
                return customers.findById(UUID.fromString(authenticatedCustomerId)).orElse(null);
            } catch (IllegalArgumentException ignored) { /* fall through to phone lookup */ }
        }
        return customers.findByPhone(phone).orElseGet(() ->
                customers.save(Customer.builder().phone(phone).name(name).phoneVerified(false).build()));
    }

    private RefundInfoDto refundInfoFor(Order order) {
        return payments.findByOrderIdOrderByCreatedAtDesc(order.getId()).stream()
                .filter(p -> p.getStatus() == Payment.Status.REFUNDED)
                .findFirst()
                .map(p -> new RefundInfoDto(p.getRefundedAmount(), p.getRazorpayRefundId()))
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public OrderDto get(UUID id) {
        Order o = orders.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No such order"));
        return mapper.toDto(o, null, refundInfoFor(o));
    }

    @Transactional(readOnly = true)
    public OrderDto getByOrderNumber(String orderNumber) {
        Order o = orders.findByOrderNumber(orderNumber).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No such order"));
        return mapper.toDto(o, null, refundInfoFor(o));
    }

    @Transactional(readOnly = true)
    public Page<OrderDto> listMine(UUID customerId, int page, int size) {
        return orders.findByCustomerIdOrderByPlacedAtDesc(customerId, PageRequest.of(page, size))
                .map(o -> mapper.toDto(o, null, refundInfoFor(o)));
    }

    // ---- admin ----
    @Transactional(readOnly = true)
    public Page<OrderDto> adminList(String status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Order> result = (status == null || status.isBlank())
                ? orders.findAllByOrderByPlacedAtDesc(pageable)
                : orders.findByStatusOrderByPlacedAtDesc(Order.Status.valueOf(status), pageable);
        return result.map(o -> mapper.toDto(o, null, refundInfoFor(o)));
    }

    @Transactional
    public OrderDto adminUpdateStatus(UUID id, String status) {
        Order o = orders.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No such order"));
        Order.Status next = Order.Status.valueOf(status);
        if (next == Order.Status.CANCELLED && o.getStatus() != Order.Status.CANCELLED) releaseStock(o);
        o.setStatus(next);
        return mapper.toDto(o, null);
    }
}
