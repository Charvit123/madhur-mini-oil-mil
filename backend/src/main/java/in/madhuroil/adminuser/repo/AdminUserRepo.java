package in.madhuroil.adminuser.repo;

import in.madhuroil.adminuser.domain.AdminUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.*;

@Repository
public interface AdminUserRepo extends JpaRepository<AdminUser, UUID> {
    Optional<AdminUser> findByUsername(String username);
    long countByRoleAndActiveTrue(AdminUser.Role role);
}
