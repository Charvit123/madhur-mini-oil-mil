package in.madhuroil.order.domain;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.UUID;

/**
 * Snapshots the variant's name, SKU and price at the moment of purchase.
 * A later price change or a retired variant must never alter a past order.
 */
@Entity
@Table(name = "order_item")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class OrderItem {

    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @Column(name = "variant_id", nullable = false) private UUID variantId;
    @Column(nullable = false, length = 60) private String sku;
    @Column(name = "product_name", nullable = false, length = 200) private String productName;
    @Column(name = "packaging_name", nullable = false, length = 80) private String packagingName;

    @Column(nullable = false, precision = 10, scale = 2) private BigDecimal unitPrice;
    @Column(nullable = false) private int quantity;
    @Column(nullable = false, precision = 10, scale = 2) private BigDecimal lineTotal;
}
