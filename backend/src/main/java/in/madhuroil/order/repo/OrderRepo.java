package in.madhuroil.order.repo;

import in.madhuroil.order.domain.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.Instant;
import java.util.*;

@Repository
public interface OrderRepo extends JpaRepository<Order, UUID> {
    Optional<Order> findByOrderNumber(String orderNumber);
    Page<Order> findByCustomerIdOrderByPlacedAtDesc(UUID customerId, Pageable pageable);
    Page<Order> findByContactPhoneOrderByPlacedAtDesc(String phone, Pageable pageable);
    Page<Order> findAllByOrderByPlacedAtDesc(Pageable pageable);
    Page<Order> findByStatusOrderByPlacedAtDesc(Order.Status status, Pageable pageable);

    /** Orders stuck in PENDING_PAYMENT past the abandonment window — the
     *  target of the stock-release sweep in OrderService#releaseAbandoned. */
    List<Order> findByStatusAndPlacedAtBefore(Order.Status status, Instant cutoff);

    long countByStatus(Order.Status status);
}
