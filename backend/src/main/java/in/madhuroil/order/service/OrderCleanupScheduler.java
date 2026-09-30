package in.madhuroil.order.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/** Sweeps abandoned carts every 10 minutes so their reserved stock comes back on sale. */
@Slf4j
@Component
@RequiredArgsConstructor
public class OrderCleanupScheduler {

    private final OrderService orderService;

    @Scheduled(fixedDelay = 10 * 60 * 1000)
    public void releaseAbandonedOrders() {
        int released = orderService.releaseAbandoned();
        if (released > 0) log.info("Released stock for {} abandoned orders", released);
    }
}
