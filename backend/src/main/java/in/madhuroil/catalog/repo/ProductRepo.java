package in.madhuroil.catalog.repo;

import in.madhuroil.catalog.domain.Product;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.*;

@Repository
public interface ProductRepo extends JpaRepository<Product, UUID> {
    @EntityGraph(attributePaths = {"oilCategory", "variants", "variants.packaging"})
    Optional<Product> findBySlugAndActiveTrue(String slug);
    List<Product> findByOilCategorySlugAndActiveTrueOrderBySortOrderAsc(String oilSlug);
    List<Product> findByFeaturedTrueAndActiveTrue();
}
