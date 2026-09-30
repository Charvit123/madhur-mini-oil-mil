package in.madhuroil.catalog.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;

/**
 * A recipe, not a purchasable thing: "Double Filtered Groundnut Oil".
 * Carries the copy, the spec sheet and the rating rollup. What a customer
 * actually buys is a ProductVariant hanging off this.
 */
@Entity
@Table(name = "product", indexes = @Index(name = "ix_product_slug", columnList = "slug", unique = true))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Product {

    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "oil_category_id", nullable = false)
    private OilCategory oilCategory;

    @NotBlank @Column(nullable = false, length = 180) private String name;
    @NotBlank @Column(nullable = false, unique = true, length = 200) private String slug;

    @Column(name = "short_description", length = 400) private String shortDescription;
    @Column(columnDefinition = "text") private String description;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "product_spec", joinColumns = @JoinColumn(name = "product_id"))
    @OrderColumn(name = "position")
    private List<Spec> specs = new ArrayList<>();

    @Column(name = "extraction_method", length = 120) private String extractionMethod;
    @Column(name = "shelf_life_months") private Integer shelfLifeMonths;
    @Column(name = "made_at", length = 120) private String madeAt;

    /** Rollups, recalculated when a review is published. */
    @Column(name = "rating_average", precision = 3, scale = 2) private BigDecimal ratingAverage = BigDecimal.ZERO;
    @Column(name = "rating_count", nullable = false) private int ratingCount = 0;

    @Column(nullable = false) private boolean active = true;
    @Column(nullable = false) private boolean featured = false;
    @Column(name = "sort_order", nullable = false) private int sortOrder = 100;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProductVariant> variants = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false) private Instant createdAt = Instant.now();
    @Column(name = "updated_at", nullable = false) private Instant updatedAt = Instant.now();
    @PreUpdate void touch() { this.updatedAt = Instant.now(); }

    @Embeddable @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class Spec {
        @Column(name = "spec_key", length = 80) private String key;
        @Column(name = "spec_value", length = 300) private String value;
    }
}
