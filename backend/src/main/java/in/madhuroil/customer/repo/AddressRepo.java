package in.madhuroil.customer.repo;

import in.madhuroil.customer.domain.Address;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.*;

@Repository
public interface AddressRepo extends JpaRepository<Address, UUID> {
    List<Address> findByCustomerIdOrderByIsDefaultDesc(UUID customerId);
    Optional<Address> findByIdAndCustomerId(UUID id, UUID customerId);
}
