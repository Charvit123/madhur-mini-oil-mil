package in.madhuroil.order.admin;

import in.madhuroil.order.domain.Payment;
import in.madhuroil.order.dto.AdminPaymentDtos.AdminPaymentDto;
import in.madhuroil.order.repo.PaymentRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Read-only, on purpose — see AdminPaymentDtos. Lists only payments that
 * actually completed money movement (CAPTURED or REFUNDED); a CREATED,
 * AUTHORIZED or FAILED row was never a real payment, so it's noise here even
 * though it's still useful debugging context on the Orders screen.
 */
@RestController
@RequestMapping("/api/admin/payments")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminPaymentController {

    private final PaymentRepo payments;

    @GetMapping
    @Transactional(readOnly = true)
    public List<AdminPaymentDto> list() {
        return payments.findCompletedWithOrderInfo(List.of(Payment.Status.CAPTURED, Payment.Status.REFUNDED))
                .stream()
                .map(row -> {
                    Payment p = (Payment) row[0];
                    String orderNumber = (String) row[1];
                    String customerName = (String) row[2];
                    return new AdminPaymentDto(
                            p.getId(), p.getOrderId(), orderNumber, customerName,
                            p.getRazorpayPaymentId(), p.getStatus().name(), p.getAmount(), p.getMethod(),
                            p.getRefundedAmount(), p.getCreatedAt());
                })
                .toList();
    }
}
