package in.madhuroil.order.repo;

import in.madhuroil.order.domain.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.*;

@Repository
public interface PaymentRepo extends JpaRepository<Payment, UUID> {
    List<Payment> findByOrderIdOrderByCreatedAtDesc(UUID orderId);
    Optional<Payment> findByRazorpayOrderId(String razorpayOrderId);
    Optional<Payment> findByRazorpayPaymentId(String razorpayPaymentId);

    /** Admin Payments screen — read-only, "payments which are done" only
     *  (captured or refunded; a CREATED/AUTHORIZED/FAILED row was never
     *  completed money movement, so it doesn't belong on that screen).
     *  Payment.orderId isn't a mapped @ManyToOne, so this is a plain
     *  cross-entity join-by-where-clause to pull the order number and
     *  contact name alongside each payment in one query. */
    @Query("select p, o.orderNumber, o.contactName from Payment p, Order o " +
           "where p.orderId = o.id and p.status in :statuses order by p.createdAt desc")
    List<Object[]> findCompletedWithOrderInfo(@Param("statuses") Collection<Payment.Status> statuses);
}
