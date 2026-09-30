package in.madhuroil.catalog.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.UUID;

/**
 * A container the mill can fill: "15 Kg Tin", "1 Litre Bottle". Its own table so
 * one pack is reused across every oil, and so the admin can add a 2 Litre Jar
 * without touching code. `kind` is what the frontend renders the artwork from.
 */
@Entity
@Table(name = "packaging")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Packaging {

    public enum Kind { TIN, BUCKET, JAR, BOTTLE, POUCH, CARTON }
    public enum Unit { KG, LITRE, ML, GRAM }

    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotBlank @Column(nullable = false, length = 80)  private String name;  // "15 Kg Tin"
    @NotBlank @Column(nullable = false, unique = true, length = 100) private String code; // "TIN-15KG"

    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20) private Kind kind;
    @NotNull @Column(nullable = false, precision = 8, scale = 3) private BigDecimal size;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 10) private Unit unit;

    // shipping inputs for the rate calculator
    @Column(name = "gross_weight_kg", precision = 8, scale = 3) private BigDecimal grossWeightKg;
    @Column(name = "length_cm") private Integer lengthCm;
    @Column(name = "width_cm")  private Integer widthCm;
    @Column(name = "height_cm") private Integer heightCm;

    @Column(name = "sort_order", nullable = false) private int sortOrder = 100;
    @Column(nullable = false) private boolean active = true;

    @Transient
    public String shortLabel() {
        return size.stripTrailingZeros().toPlainString() + " " +
               switch (unit) { case KG -> "Kg"; case LITRE -> "L"; case ML -> "ml"; case GRAM -> "g"; };
    }
}
