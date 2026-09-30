package in.madhuroil.customer.repo;

import in.madhuroil.customer.domain.OtpToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.Instant;
import java.util.*;

@Repository
public interface OtpTokenRepo extends JpaRepository<OtpToken, UUID> {
    Optional<OtpToken> findFirstByPhoneAndConsumedFalseOrderByCreatedAtDesc(String phone);

    @Modifying
    @Query("delete from OtpToken t where t.expiresAt < :cutoff")
    int deleteExpired(Instant cutoff);
}
