package in.madhuroil.catalog.repo;

import in.madhuroil.catalog.domain.ProductVariant;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.util.*;

@Repository
public interface ProductVariantRepo extends JpaRepository<ProductVariant, UUID>,
                                            JpaSpecificationExecutor<ProductVariant> {

    @EntityGraph(attributePaths = {"product", "product.oilCategory", "packaging"})
    @Query("select v from ProductVariant v where v.active = true and v.product.active = true")
    List<ProductVariant> findAllLive();

    Optional<ProductVariant> findBySku(String sku);

    @Query("select min(v.price) from ProductVariant v where v.product.oilCategory.slug = :slug and v.active = true")
    BigDecimal minPriceForOil(@Param("slug") String slug);

    List<ProductVariant> findByStockLessThanEqualAndActiveTrue(int threshold);

    /**
     * Atomic decrement. Returns 0 rows when stock is insufficient, which the
     * order service treats as "someone else took the last tin".
     */
    @Modifying
    @Query("update ProductVariant v set v.stock = v.stock - :qty where v.id = :id and v.stock >= :qty")
    int reserve(@Param("id") UUID id, @Param("qty") int qty);
}
