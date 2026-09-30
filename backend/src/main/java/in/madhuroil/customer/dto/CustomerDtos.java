package in.madhuroil.customer.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.*;
import java.util.UUID;

@JsonInclude(JsonInclude.Include.NON_NULL)
public final class CustomerDtos {

    public record OtpRequest(@NotBlank @Pattern(regexp = "^[6-9]\\d{9}$") String phone) {}

    public record OtpVerifyRequest(
            @NotBlank @Pattern(regexp = "^[6-9]\\d{9}$") String phone,
            @NotBlank @Pattern(regexp = "^\\d{6}$") String code) {}

    public record AuthResponse(String token, CustomerDto customer) {}

    public record CustomerDto(UUID id, String phone, String name, String email, boolean phoneVerified) {}

    public record AddressForm(
            @NotBlank String fullName,
            @NotBlank @Pattern(regexp = "^[6-9]\\d{9}$") String phone,
            @NotBlank String line1, String line2,
            @NotBlank String city, @NotBlank String state,
            @NotBlank @Pattern(regexp = "^\\d{6}$") String pincode,
            Boolean isDefault) {}

    public record AddressDto(
            UUID id, String fullName, String phone, String line1, String line2,
            String city, String state, String pincode, boolean isDefault) {}

    private CustomerDtos() {}
}
