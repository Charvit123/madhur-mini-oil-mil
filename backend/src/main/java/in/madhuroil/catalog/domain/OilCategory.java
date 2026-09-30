package in.madhuroil.catalog.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.Instant;
import java.util.*;

/**
 * Top of the catalogue tree: Groundnut, Sesame, Cottonseed, or whatever the
 * mill starts pressing next. Inserting a row publishes a category page, a shop
 * filter and a footer link. No frontend release.
 */
@Entity
@Table(name = "oil_category", indexes = @Index(name = "ix_oil_slug", columnList = "slug", unique = true))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class OilCategory {

    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotBlank @Column(nullable = false, length = 120)
    private String name;                 // "Groundnut Oil"

    @NotBlank @Column(nullable = false, unique = true, length = 140)
    private String slug;                 // "groundnut-oil" -> /shop/groundnut-oil

    @Column(length = 200)  private String tagline;
    @Column(columnDefinition = "text") private String description;

    /** Hex that tints the generated pack illustration, e.g. #E2A227. */
    @Pattern(regexp = "^#([0-9a-fA-F]{6})$")
    @Column(name = "oil_color", nullable = false, length = 7)
    private String oilColor;

    @Pattern(regexp = "^#([0-9a-fA-F]{6})$")
    @Column(name = "seed_color", length = 7)
    private String seedColor;

    @Column(name = "hero_image_url", length = 500) private String heroImageUrl;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "oil_feature", joinColumns = @JoinColumn(name = "oil_id"))
    @Column(name = "feature", length = 300)
    @OrderColumn(name = "position")
    private List<String> features = new ArrayList<>();

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "oil_benefit", joinColumns = @JoinColumn(name = "oil_id"))
    @OrderColumn(name = "position")
    private List<Benefit> benefits = new ArrayList<>();

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "oil_faq", joinColumns = @JoinColumn(name = "oil_id"))
    @OrderColumn(name = "position")
    private List<Faq> faqs = new ArrayList<>();

    @Column(name = "sort_order", nullable = false) private int sortOrder = 100;
    @Column(nullable = false) private boolean active = true;

    @Column(name = "meta_title", length = 200) private String metaTitle;
    @Column(name = "meta_description", length = 320) private String metaDescription;

    @Column(name = "created_at", nullable = false, updatable = false) private Instant createdAt = Instant.now();
    @Column(name = "updated_at", nullable = false) private Instant updatedAt = Instant.now();
    @PreUpdate void touch() { this.updatedAt = Instant.now(); }

    @Embeddable @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class Benefit {
        @Column(length = 80) private String title;
        @Column(length = 400) private String body;
    }

    @Embeddable @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class Faq {
        @Column(length = 250) private String question;
        @Column(length = 1200) private String answer;
    }
}
