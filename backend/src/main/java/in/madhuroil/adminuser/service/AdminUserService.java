package in.madhuroil.adminuser.service;

import in.madhuroil.adminuser.domain.AdminUser;
import in.madhuroil.adminuser.dto.AdminUserDtos.*;
import in.madhuroil.adminuser.repo.AdminUserRepo;
import in.madhuroil.config.JwtIssuer;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminUserService {

    private final AdminUserRepo admins;
    private final JwtIssuer jwt;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public LoginResponse login(String username, String password) {
        AdminUser admin = admins.findByUsername(username)
                .filter(AdminUser::isActive)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Incorrect username or password"));

        if (!encoder.matches(password, admin.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Incorrect username or password");
        }

        admin.setLastLoginAt(Instant.now());

        // Every admin gets ROLE_ADMIN; SUPER_ADMIN also gets ROLE_SUPER_ADMIN,
        // which is what gates AdminUserController's own management endpoints.
        List<String> roles = admin.getRole() == AdminUser.Role.SUPER_ADMIN
                ? List.of("ADMIN", "SUPER_ADMIN")
                : List.of("ADMIN");
        String token = jwt.issue("admin:" + admin.getUsername(), roles, Duration.ofHours(12));

        return new LoginResponse(token, toView(admin));
    }

    @Transactional(readOnly = true)
    public List<AdminUserView> list() {
        return admins.findAll().stream().map(this::toView).toList();
    }

    public AdminUserView create(CreateAdminUserForm form) {
        if (admins.findByUsername(form.username()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "That username is already taken");
        }
        AdminUser.Role role;
        try {
            role = AdminUser.Role.valueOf(form.role());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "role must be ADMIN or SUPER_ADMIN");
        }

        AdminUser admin = AdminUser.builder()
                .username(form.username())
                .passwordHash(encoder.encode(form.password()))
                .fullName(form.fullName())
                .role(role)
                .active(true)
                .build();
        return toView(admins.save(admin));
    }

    /** Refuses to deactivate the last active SUPER_ADMIN — that would lock everyone out of admin management. */
    public void deactivate(UUID id) {
        AdminUser admin = admins.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No such admin"));

        if (admin.getRole() == AdminUser.Role.SUPER_ADMIN
                && admin.isActive()
                && admins.countByRoleAndActiveTrue(AdminUser.Role.SUPER_ADMIN) <= 1) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cannot deactivate the last active super admin");
        }
        admin.setActive(false);
    }

    public void reactivate(UUID id) {
        AdminUser admin = admins.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No such admin"));
        admin.setActive(true);
    }

    private AdminUserView toView(AdminUser a) {
        return new AdminUserView(a.getId(), a.getUsername(), a.getFullName(), a.getRole().name(),
                a.isActive(), a.getCreatedAt(), a.getLastLoginAt());
    }
}
