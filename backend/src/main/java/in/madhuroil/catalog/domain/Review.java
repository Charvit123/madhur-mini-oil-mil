package in.madhuroil.catalog.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "review", indexes = @Index(name = "ix_review_product", columnList = "product_id"))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Review {

    public enum Status { PENDING, PUBLISHED, REJECTED }

    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "order_id") private UUID orderId;
    @Column(name = "verified_purchase", nullable = false) private boolean verifiedPurchase = false;

    @NotBlank @Column(name = "author_name", nullable = false, length = 120) private String authorName;
    @Column(length = 120) private String city;

    @Min(1) @Max(5) @Column(nullable = false) private int rating;
    @Column(length = 160) private String title;
    @Column(columnDefinition = "text") private String body;

    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20)
    private Status status = Status.PENDING;

    @Column(name = "created_at", nullable = false, updatable = false) private Instant createdAt = Instant.now();
}
