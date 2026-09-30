package in.madhuroil.catalog.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.Instant;
import java.util.UUID;

@JsonInclude(JsonInclude.Include.NON_NULL)
public final class AdminReviewDtos {

    public record AdminReviewDto(
            UUID id, UUID productId, String productName,
            String authorName, String city, int rating, String title, String body,
            boolean verifiedPurchase, String status, Instant createdAt) {}

    private AdminReviewDtos() {}
}
