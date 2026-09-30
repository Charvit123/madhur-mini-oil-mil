package in.madhuroil.order.web;

import in.madhuroil.order.dto.OrderDtos.*;
import in.madhuroil.order.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Order creation is intentionally reachable without a customer being logged
 * in (guest checkout matches the frontend's checkout flow), while listing
 * "my orders" requires the JWT issued by /api/auth/otp/verify.
 */
@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orders;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OrderDto create(@Valid @RequestBody CreateOrderRequest req, @AuthenticationPrincipal Jwt jwt) {
        return orders.createOrder(req, jwt == null ? null : jwt.getSubject());
    }

    @GetMapping("/{id}")
    public OrderDto get(@PathVariable UUID id) { return orders.get(id); }

    @GetMapping("/by-number/{orderNumber}")
    public OrderDto getByNumber(@PathVariable String orderNumber) { return orders.getByOrderNumber(orderNumber); }

    @PostMapping("/{id}/verify-payment")
    public OrderDto verifyPayment(@PathVariable UUID id, @Valid @RequestBody VerifyPaymentRequest req) {
        return orders.verifyPayment(id, req);
    }

    @GetMapping("/mine")
    public Page<OrderDto> mine(@AuthenticationPrincipal Jwt jwt,
                               @RequestParam(defaultValue = "0") int page,
                               @RequestParam(defaultValue = "10") int size) {
        return orders.listMine(UUID.fromString(jwt.getSubject()), page, size);
    }
}
