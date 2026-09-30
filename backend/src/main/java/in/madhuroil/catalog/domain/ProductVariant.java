package in.madhuroil.catalog.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.util.*;

/**
 * The purchasable row: one Product in one Packaging. Price, MRP, stock, SKU and
 * batch live here, which is why the pack selector on the PDP can swap image,
 * price, SKU and availability by switching one object.
 */
@Entity
@Table(name = "product_variant",
       uniqueConstraints = @UniqueConstraint(name = "uq_variant_product_packaging",
                                             columnNames = {"product_id", "packaging_id"}),
       indexes = @Index(name = "ix_variant_sku", columnList = "sku", unique = true))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ProductVariant {

    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "packaging_id", nullable = false)
    private Packaging packaging;

    @NotBlank @Column(nullable = false, unique = true, length = 60) private String sku;

    @NotNull @DecimalMin("0.00")
    @Column(nullable = false, precision = 10, scale = 2) private BigDecimal price;   // GST inclusive
    @Column(precision = 10, scale = 2) private BigDecimal mrp;
    @Column(name = "gst_rate", precision = 5, scale = 2) private BigDecimal gstRate = new BigDecimal("5.00");

    @Min(0) @Column(nullable = false) private int stock;
    @Min(0) @Column(name = "low_stock_threshold", nullable = false) private int lowStockThreshold = 10;

    @Column(name = "batch_code", length = 40) private String batchCode;
    @Column(name = "pressed_on") private LocalDate pressedOn;
    @Column(name = "best_before") private LocalDate bestBefore;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "variant_image", joinColumns = @JoinColumn(name = "variant_id"))
    @Column(name = "url", length = 500)
    @OrderColumn(name = "position")
    private List<String> imageUrls = new ArrayList<>();

    @Column(nullable = false) private boolean active = true;

    @Version private long version;   // optimistic lock, stops oversell on concurrent checkout

    @Column(name = "created_at", nullable = false, updatable = false) private Instant createdAt = Instant.now();
    @Column(name = "updated_at", nullable = false) private Instant updatedAt = Instant.now();
    @PreUpdate void touch() { this.updatedAt = Instant.now(); }

    @Transient public boolean isInStock()  { return active && stock > 0; }
    @Transient public boolean isLowStock() { return stock > 0 && stock <= lowStockThreshold; }
    @Transient public int discountPercent() {
        if (mrp == null || mrp.compareTo(price) <= 0) return 0;
        return mrp.subtract(price).multiply(BigDecimal.valueOf(100))
                  .divide(mrp, 0, RoundingMode.HALF_UP).intValue();
    }
}
