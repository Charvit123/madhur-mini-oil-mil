package in.madhuroil.adminuser.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.*;
import java.time.Instant;
import java.util.UUID;

@JsonInclude(JsonInclude.Include.NON_NULL)
public final class AdminUserDtos {

    public record LoginRequest(@NotBlank String username, @NotBlank String password) {}

    /** Never carries the password hash — this is what the login response and admin list show. */
    public record AdminUserView(UUID id, String username, String fullName, String role,
                                boolean active, Instant createdAt, Instant lastLoginAt) {}

    public record LoginResponse(String token, AdminUserView admin) {}

    public record CreateAdminUserForm(
            @NotBlank @Size(min = 3, max = 60) String username,
            @NotBlank @Size(min = 8) String password,
            String fullName,
            @NotNull String role) {} // "ADMIN" | "SUPER_ADMIN"

    private AdminUserDtos() {}
}
