package in.madhuroil.config;

import in.madhuroil.adminuser.dto.AdminUserDtos.LoginRequest;
import in.madhuroil.adminuser.dto.AdminUserDtos.LoginResponse;
import in.madhuroil.adminuser.service.AdminUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/auth")
@RequiredArgsConstructor
public class AdminAuthController {

    private final AdminUserService admins;

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest req) {
        return admins.login(req.username(), req.password());
    }
}
