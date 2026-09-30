package in.madhuroil.customer.service;

import in.madhuroil.customer.domain.Address;
import in.madhuroil.customer.dto.CustomerDtos.*;
import in.madhuroil.customer.repo.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class AddressService {

    private final AddressRepo addresses;
    private final CustomerRepo customers;

    public List<AddressDto> list(UUID customerId) {
        return addresses.findByCustomerIdOrderByIsDefaultDesc(customerId).stream().map(this::toDto).toList();
    }

    public AddressDto create(UUID customerId, AddressForm form) {
        var customer = customers.findById(customerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No such customer"));

        boolean makeDefault = Boolean.TRUE.equals(form.isDefault()) || addresses.findByCustomerIdOrderByIsDefaultDesc(customerId).isEmpty();
        if (makeDefault) clearExistingDefault(customerId);

        Address saved = addresses.save(Address.builder()
                .customer(customer).fullName(form.fullName()).phone(form.phone())
                .line1(form.line1()).line2(form.line2()).city(form.city()).state(form.state())
                .pincode(form.pincode()).isDefault(makeDefault).build());
        return toDto(saved);
    }

    public void delete(UUID customerId, UUID addressId) {
        Address a = addresses.findByIdAndCustomerId(addressId, customerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No such address"));
        addresses.delete(a);
    }

    private void clearExistingDefault(UUID customerId) {
        addresses.findByCustomerIdOrderByIsDefaultDesc(customerId).stream()
                .filter(Address::isDefault)
                .forEach(a -> a.setDefault(false));
    }

    private AddressDto toDto(Address a) {
        return new AddressDto(a.getId(), a.getFullName(), a.getPhone(), a.getLine1(), a.getLine2(),
                a.getCity(), a.getState(), a.getPincode(), a.isDefault());
    }
}
