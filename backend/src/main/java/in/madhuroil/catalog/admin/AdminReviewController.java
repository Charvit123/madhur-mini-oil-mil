package in.madhuroil.catalog.admin;

import in.madhuroil.catalog.domain.Review;
import in.madhuroil.catalog.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin/reviews")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminReviewController {

    private final ReviewService reviews;

    @GetMapping("/pending")
    public Page<Review> pending(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        return reviews.pending(page, size);
    }

    @PostMapping("/{id}/approve")
    public void approve(@PathVariable UUID id) { reviews.approve(id); }

    @PostMapping("/{id}/reject")
    public void reject(@PathVariable UUID id) { reviews.reject(id); }
}
