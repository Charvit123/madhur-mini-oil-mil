package in.madhuroil.catalog.admin;

import in.madhuroil.catalog.domain.Review;
import in.madhuroil.catalog.dto.AdminReviewDtos.AdminReviewDto;
import in.madhuroil.catalog.repo.ReviewRepo;
import in.madhuroil.catalog.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Reviews are moderated, not authored, by an admin: approve/reject decide
 * whether a customer's review is published, and delete removes one outright
 * (spam, abuse, a customer's takedown request). There is deliberately no
 * "edit review text" and no "create a review" endpoint here.
 */
@RestController
@RequestMapping("/api/admin/reviews")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminReviewController {

    private final ReviewService reviews;
    private final ReviewRepo reviewRepo;

    @GetMapping
    @Transactional(readOnly = true)
    public List<AdminReviewDto> list() {
        return reviewRepo.findAllForAdmin().stream().map(this::toDto).toList();
    }

    @GetMapping("/pending")
    public Page<Review> pending(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        return reviews.pending(page, size);
    }

    @PostMapping("/{id}/approve")
    public void approve(@PathVariable UUID id) { reviews.approve(id); }

    @PostMapping("/{id}/reject")
    public void reject(@PathVariable UUID id) { reviews.reject(id); }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable UUID id) { reviews.delete(id); }

    private AdminReviewDto toDto(Review r) {
        return new AdminReviewDto(r.getId(), r.getProduct().getId(), r.getProduct().getName(),
                r.getAuthorName(), r.getCity(), r.getRating(), r.getTitle(), r.getBody(),
                r.isVerifiedPurchase(), r.getStatus().name(), r.getCreatedAt());
    }
}
