package in.madhuroil.dashboard;

import in.madhuroil.catalog.repo.ProductVariantRepo;
import in.madhuroil.dashboard.DashboardDtos.*;
import in.madhuroil.order.domain.Order;
import in.madhuroil.order.repo.OrderRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminDashboardService {

    /** Orders counted as real, collected revenue. Excludes PENDING_PAYMENT
     *  (not yet paid), PAYMENT_FAILED/CANCELLED (never collected) and
     *  REFUNDED (money went back out). */
    private static final List<Order.Status> REVENUE_STATUSES =
            List.of(Order.Status.PAID, Order.Status.PACKED, Order.Status.DISPATCHED, Order.Status.DELIVERED);

    private final OrderRepo orders;
    private final ProductVariantRepo variants;

    public DashboardStatsDto stats() {
        ZoneId zone = ZoneId.of("Asia/Kolkata");
        Instant now = Instant.now();

        YearMonth thisMonth = YearMonth.now(zone);
        Instant thisMonthStart = thisMonth.atDay(1).atStartOfDay(zone).toInstant();
        Instant nextMonthStart = thisMonth.plusMonths(1).atDay(1).atStartOfDay(zone).toInstant();
        YearMonth lastMonth = thisMonth.minusMonths(1);
        Instant lastMonthStart = lastMonth.atDay(1).atStartOfDay(zone).toInstant();

        BigDecimal revenueThisMonth = orders.sumTotal(REVENUE_STATUSES, thisMonthStart, nextMonthStart);
        BigDecimal revenueLastMonth = orders.sumTotal(REVENUE_STATUSES, lastMonthStart, thisMonthStart);
        double changePercent = revenueLastMonth.compareTo(BigDecimal.ZERO) == 0
                ? (revenueThisMonth.compareTo(BigDecimal.ZERO) > 0 ? 100.0 : 0.0)
                : revenueThisMonth.subtract(revenueLastMonth)
                        .divide(revenueLastMonth, 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100)).doubleValue();

        long ordersThisMonth = orders.countByStatusInAndPlacedAtBetween(REVENUE_STATUSES, thisMonthStart, nextMonthStart);
        long pendingOrders = orders.countByStatus(Order.Status.PAID); // paid, not yet packed for dispatch

        long activeVariants = variants.countByActiveTrue();
        long lowStockCount = variants.countLowStock();

        List<RecentOrderDto> recent = orders.findTop6ByOrderByPlacedAtDesc().stream()
                .map(this::toRecentOrderDto)
                .toList();

        List<WeeklySalesDto> weeklySales = buildWeeklySales(now, zone);

        return new DashboardStatsDto(revenueThisMonth, revenueLastMonth, changePercent,
                ordersThisMonth, pendingOrders, activeVariants, lowStockCount, recent, weeklySales);
    }

    private RecentOrderDto toRecentOrderDto(Order o) {
        String items = o.getItems().stream()
                .map(i -> i.getProductName() + " " + i.getPackagingName() + " x" + i.getQuantity())
                .collect(Collectors.joining(", "));
        boolean paid = REVENUE_STATUSES.contains(o.getStatus());
        return new RecentOrderDto(o.getOrderNumber(), o.getContactName(),
                items.isBlank() ? "—" : items, o.getTotal(), o.getStatus().name(), paid, o.getPlacedAt());
    }

    /** 12 weekly buckets ending this week, oldest first. Bucketed in Java
     *  (not JPQL date-trunc) so this stays portable across DB engines. */
    private List<WeeklySalesDto> buildWeeklySales(Instant now, ZoneId zone) {
        int weeks = 12;
        Instant from = now.minus(Duration.ofDays(weeks * 7L));
        List<Object[]> rows = orders.salesSince(REVENUE_STATUSES, from);

        BigDecimal[] buckets = new BigDecimal[weeks];
        Arrays.fill(buckets, BigDecimal.ZERO);

        for (Object[] row : rows) {
            Instant placedAt = (Instant) row[0];
            BigDecimal total = (BigDecimal) row[1];
            long daysAgo = Duration.between(placedAt, now).toDays();
            int bucketFromEnd = (int) (daysAgo / 7); // 0 = this week, 1 = last week, ...
            int idx = weeks - 1 - bucketFromEnd;
            if (idx >= 0 && idx < weeks) buckets[idx] = buckets[idx].add(total);
        }

        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("d MMM");
        List<WeeklySalesDto> result = new ArrayList<>(weeks);
        for (int i = 0; i < weeks; i++) {
            LocalDate weekStart = LocalDate.ofInstant(now, zone).minusWeeks(weeks - 1L - i).with(java.time.DayOfWeek.MONDAY);
            result.add(new WeeklySalesDto(weekStart.format(fmt), buckets[i]));
        }
        return result;
    }
}
