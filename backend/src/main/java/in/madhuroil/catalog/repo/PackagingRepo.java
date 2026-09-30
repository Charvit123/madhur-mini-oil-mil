package in.madhuroil.catalog.repo;

import in.madhuroil.catalog.domain.Packaging;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.*;

@Repository
public interface PackagingRepo extends JpaRepository<Packaging, UUID> {
    List<Packaging> findByActiveTrueOrderBySortOrderAsc();
    Optional<Packaging> findByCode(String code);

    /** Admin listing — includes retired packagings too, so they can be reactivated. */
    List<Packaging> findAllByOrderBySortOrderAsc();
}
