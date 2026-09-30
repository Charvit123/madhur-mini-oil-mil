package in.madhuroil.catalog.repo;

import in.madhuroil.catalog.domain.OilCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.*;

@Repository
public interface OilCategoryRepo extends JpaRepository<OilCategory, UUID> {
    List<OilCategory> findByActiveTrueOrderBySortOrderAsc();
    Optional<OilCategory> findBySlugAndActiveTrue(String slug);
    boolean existsBySlug(String slug);
}
