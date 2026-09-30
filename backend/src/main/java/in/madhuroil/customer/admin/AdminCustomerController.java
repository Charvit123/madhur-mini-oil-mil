package in.madhuroil.customer.admin;

import in.madhuroil.customer.domain.Customer;
import in.madhuroil.customer.dto.CustomerDtos.CustomerDto;
import in.madhuroil.customer.repo.CustomerRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/customers")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminCustomerController {

    private final CustomerRepo customers;

    @GetMapping
    public Page<CustomerDto> list(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        return customers.findAll(PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")))
                .map(this::toDto);
    }

    private CustomerDto toDto(Customer c) {
        return new CustomerDto(c.getId(), c.getPhone(), c.getName(), c.getEmail(), c.isPhoneVerified());
    }
}
