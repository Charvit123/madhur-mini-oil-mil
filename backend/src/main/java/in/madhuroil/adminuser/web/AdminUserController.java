package in.madhuroil.adminuser.web;

import in.madhuroil.adminuser.dto.AdminUserDtos.*;
import in.madhuroil.adminuser.service.AdminUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Managing who else can sign in as an admin — deliberately locked to
 * SUPER_ADMIN only, both here (@PreAuthorize) and again at the URL level in
 * SecurityConfig (/api/admin/admins/** -> hasRole('SUPER_ADMIN')). A regular
 * ADMIN can do everything operational but can't create or remove logins.
 */
@RestController
@RequestMapping("/api/admin/admins")
@PreAuthorize("hasRole('SUPER_ADMIN')")
@RequiredArgsConstructor
public class AdminUserController {

    private final AdminUserService admins;

    @GetMapping
    public List<AdminUserView> list() { return admins.list(); }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AdminUserView create(@Valid @RequestBody CreateAdminUserForm form) { return admins.create(form); }

    @PatchMapping("/{id}/deactivate")
    public void deactivate(@PathVariable UUID id) { admins.deactivate(id); }

    @PatchMapping("/{id}/reactivate")
    public void reactivate(@PathVariable UUID id) { admins.reactivate(id); }
}
