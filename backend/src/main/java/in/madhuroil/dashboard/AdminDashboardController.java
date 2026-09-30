package in.madhuroil.dashboard;

import in.madhuroil.dashboard.DashboardDtos.DashboardStatsDto;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/dashboard")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminDashboardController {

    private final AdminDashboardService dashboard;

    @GetMapping("/stats")
    public DashboardStatsDto stats() {
        return dashboard.stats();
    }
}
