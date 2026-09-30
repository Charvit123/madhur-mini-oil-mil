package in.madhuroil.catalog.repo;

import in.madhuroil.catalog.domain.Product;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.*;

@Repository
public interface ProductRepo extends JpaRepository<Product, UUID> {
    @EntityGraph(attributePaths = {"oilCategory", "variants", "variants.packaging"})
    Optional<Product> findBySlugAndActiveTrue(String slug);
    List<Product> findByOilCategorySlugAndActiveTrueOrderBySortOrderAsc(String oilSlug);
    List<Product> findByFeaturedTrueAndActiveTrue();
    boolean existsBySlug(String slug);

    /** Admin listing — includes retired products too, so they can be reactivated.
     *  oilCategory eagerly loaded so the admin table can show the oil name
     *  without a lazy-init failure (open-in-view is off, by design). */
    @EntityGraph(attributePaths = {"oilCategory"})
    List<Product> findAllByOrderBySortOrderAsc();

    @EntityGraph(attributePaths = {"oilCategory"})
    @Query("select p from Product p where p.id = :id")
    Optional<Product> findByIdWithOilCategory(@Param("id") UUID id);
}
