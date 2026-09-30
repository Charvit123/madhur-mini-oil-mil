package in.madhuroil.dashboard;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public final class DashboardDtos {

    public record RecentOrderDto(
            String orderNumber, String customerName, String itemsSummary,
            BigDecimal total, String status, boolean paid, Instant placedAt) {}

    /** One bar in the "sales, last 12 weeks" chart. */
    public record WeeklySalesDto(String weekLabel, BigDecimal total) {}

    public record DashboardStatsDto(
            BigDecimal revenueThisMonth, BigDecimal revenueLastMonth, double revenueChangePercent,
            long ordersThisMonth, long pendingOrders,
            long activeVariants, long lowStockCount,
            List<RecentOrderDto> recentOrders,
            List<WeeklySalesDto> salesLast12Weeks) {}

    private DashboardDtos() {}
}
