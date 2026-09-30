package in.madhuroil.order.repo;

import in.madhuroil.order.domain.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
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

    // ---- dashboard aggregates ----

    @Query("select coalesce(sum(o.total), 0) from Order o " +
           "where o.status in :statuses and o.placedAt >= :from and o.placedAt < :to")
    BigDecimal sumTotal(@Param("statuses") Collection<Order.Status> statuses,
                        @Param("from") Instant from, @Param("to") Instant to);

    @Query("select count(o) from Order o " +
           "where o.status in :statuses and o.placedAt >= :from and o.placedAt < :to")
    long countByStatusInAndPlacedAtBetween(@Param("statuses") Collection<Order.Status> statuses,
                                           @Param("from") Instant from, @Param("to") Instant to);

    /** Raw (date, total) pairs for the sales chart — bucketed into weeks in
     *  Java rather than in JPQL, since date-truncation isn't portable SQL. */
    @Query("select o.placedAt, o.total from Order o " +
           "where o.status in :statuses and o.placedAt >= :from order by o.placedAt asc")
    List<Object[]> salesSince(@Param("statuses") Collection<Order.Status> statuses, @Param("from") Instant from);

    @EntityGraph(attributePaths = {"items"})
    List<Order> findTop6ByOrderByPlacedAtDesc();
}
