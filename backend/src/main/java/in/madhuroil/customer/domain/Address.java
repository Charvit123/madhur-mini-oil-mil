package in.madhuroil.customer.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "address")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Address {

    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @NotBlank @Column(nullable = false, length = 120) private String fullName;
    @NotBlank @Pattern(regexp = "^[6-9]\\d{9}$") @Column(nullable = false, length = 10) private String phone;
    @NotBlank @Column(nullable = false, length = 240) private String line1;
    @Column(length = 240) private String line2;
    @NotBlank @Column(nullable = false, length = 100) private String city;
    @NotBlank @Column(nullable = false, length = 100) private String state;
    @NotBlank @Pattern(regexp = "^\\d{6}$") @Column(nullable = false, length = 6) private String pincode;

    @Column(name = "is_default", nullable = false) private boolean isDefault = false;
}
