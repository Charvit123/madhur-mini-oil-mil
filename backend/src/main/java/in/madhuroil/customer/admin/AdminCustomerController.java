package in.madhuroil.customer.admin;

import in.madhuroil.customer.domain.Customer;
import in.madhuroil.customer.dto.CustomerDtos.AdminCustomerDto;
import in.madhuroil.customer.dto.CustomerDtos.AdminCustomerForm;
import in.madhuroil.customer.repo.CustomerRepo;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

/**
 * Customers are never hard-deleted (their orders reference them by id and
 * must stay resolvable) — "delete" here means deactivate, same soft-delete
 * pattern as the rest of the admin panel. A deactivated customer can no
 * longer sign in (see AuthService#verifyOtp) but their order history is
 * untouched.
 */
@RestController
@RequestMapping("/api/admin/customers")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminCustomerController {

    private final CustomerRepo customers;

    @GetMapping
    @Transactional(readOnly = true)
    public List<AdminCustomerDto> list() {
        return customers.findAllByOrderByCreatedAtDesc().stream().map(this::toDto).toList();
    }

    @PutMapping("/{id}")
    @Transactional
    public AdminCustomerDto update(@PathVariable UUID id, @Valid @RequestBody AdminCustomerForm f) {
        Customer c = customers.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No such customer"));
        if (f.name() != null) c.setName(f.name());
        if (f.email() != null) c.setEmail(f.email());
        return toDto(c);
    }

    @PatchMapping("/{id}/deactivate")
    @Transactional
    public void deactivate(@PathVariable UUID id) {
        customers.findById(id).ifPresent(c -> c.setActive(false));
    }

    @PatchMapping("/{id}/reactivate")
    @Transactional
    public void reactivate(@PathVariable UUID id) {
        customers.findById(id).ifPresent(c -> c.setActive(true));
    }

    private AdminCustomerDto toDto(Customer c) {
        return new AdminCustomerDto(c.getId(), c.getPhone(), c.getName(), c.getEmail(),
                c.isPhoneVerified(), c.isActive(), c.getCreatedAt());
    }
}
