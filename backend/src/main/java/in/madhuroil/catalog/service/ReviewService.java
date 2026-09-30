package in.madhuroil.catalog.service;

import in.madhuroil.catalog.domain.Product;
import in.madhuroil.catalog.domain.Review;
import in.madhuroil.catalog.repo.ProductRepo;
import in.madhuroil.catalog.repo.ReviewRepo;
import jakarta.validation.constraints.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class ReviewService {

    private final ReviewRepo reviews;
    private final ProductRepo products;

    public record SubmitReviewForm(
            @NotNull UUID productId, @NotBlank String authorName, String city,
            @Min(1) @Max(5) int rating, String title, String body, UUID orderId) {}

    /** Public write: lands as PENDING and never touches the rating rollup
     *  until an admin publishes it (see approve()). */
    public Review submit(SubmitReviewForm f) {
        Product product = products.findById(f.productId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown product"));
        return reviews.save(Review.builder()
                .product(product).authorName(f.authorName()).city(f.city())
                .rating(f.rating()).title(f.title()).body(f.body())
                .orderId(f.orderId()).verifiedPurchase(f.orderId() != null)
                .status(Review.Status.PENDING).build());
    }

    @Transactional(readOnly = true)
    public Page<Review> pending(int page, int size) {
        return reviews.findByStatusOrderByCreatedAtDesc(Review.Status.PENDING, PageRequest.of(page, size));
    }

    public Review approve(UUID id) {
        Review r = get(id);
        r.setStatus(Review.Status.PUBLISHED);
        recomputeRollup(r.getProduct().getId());
        return r;
    }

    public Review reject(UUID id) {
        Review r = get(id);
        r.setStatus(Review.Status.REJECTED);
        return r;
    }

    private Review get(UUID id) {
        return reviews.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No such review"));
    }

    private void recomputeRollup(UUID productId) {
        Object[] rollup = reviews.ratingRollup(productId);
        double avg = ((Number) rollup[0]).doubleValue();
        long count = ((Number) rollup[1]).longValue();
        products.findById(productId).ifPresent(p -> {
            p.setRatingAverage(BigDecimal.valueOf(avg).setScale(2, RoundingMode.HALF_UP));
            p.setRatingCount((int) count);
        });
    }
}
