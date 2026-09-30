package in.madhuroil.catalog.repo;

import in.madhuroil.catalog.domain.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface ReviewRepo extends JpaRepository<Review, UUID> {
    Page<Review> findByProductIdAndStatus(UUID productId, Review.Status status, Pageable pageable);
    Page<Review> findByStatusOrderByCreatedAtDesc(Review.Status status, Pageable pageable);
    @Query("select coalesce(avg(r.rating),0), count(r) from Review r where r.product.id = :pid and r.status = 'PUBLISHED'")
    Object[] ratingRollup(@Param("pid") UUID productId);
}
