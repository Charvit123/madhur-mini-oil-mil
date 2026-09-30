package in.madhuroil.order.admin;

import in.madhuroil.order.dto.OrderDtos.*;
import in.madhuroil.order.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin/orders")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminOrderController {

    private final OrderService orders;

    @GetMapping
    public Page<OrderDto> list(@RequestParam(required = false) String status,
                               @RequestParam(defaultValue = "0") int page,
                               @RequestParam(defaultValue = "20") int size) {
        return orders.adminList(status, page, size);
    }

    @GetMapping("/{id}")
    public OrderDto get(@PathVariable UUID id) { return orders.get(id); }

    @PatchMapping("/{id}/status")
    public OrderDto updateStatus(@PathVariable UUID id, @Valid @RequestBody UpdateOrderStatusRequest req) {
        return orders.adminUpdateStatus(id, req.status());
    }

    /** Issues a real refund through Razorpay for gateway-paid orders, or
     *  marks a COD order refunded (nothing to call — cash was never
     *  collected through the gateway). See OrderService#adminRefund. */
    @PostMapping("/{id}/refund")
    public OrderDto refund(@PathVariable UUID id) {
        return orders.adminRefund(id);
    }
}
