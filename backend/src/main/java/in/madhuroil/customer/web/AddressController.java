package in.madhuroil.customer.web;

import in.madhuroil.customer.dto.CustomerDtos.*;
import in.madhuroil.customer.service.AddressService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/** Every route here is behind ROLE_CUSTOMER (see SecurityConfig), so the
 *  customer id always comes from the verified JWT subject, never a path param. */
@RestController
@RequestMapping("/api/account/addresses")
@RequiredArgsConstructor
public class AddressController {

    private final AddressService addresses;

    @GetMapping
    public List<AddressDto> list(@AuthenticationPrincipal Jwt jwt) {
        return addresses.list(UUID.fromString(jwt.getSubject()));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AddressDto create(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody AddressForm form) {
        return addresses.create(UUID.fromString(jwt.getSubject()), form);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id) {
        addresses.delete(UUID.fromString(jwt.getSubject()), id);
    }
}
