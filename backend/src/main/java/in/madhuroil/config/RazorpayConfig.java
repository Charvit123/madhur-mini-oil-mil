package in.madhuroil.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

import java.nio.charset.StandardCharsets;
import java.util.Base64;

/**
 * A plain RestClient talking to Razorpay's REST API directly, instead of the
 * official razorpay-java SDK. See RazorpayService for why: the SDK's exact
 * method/field names (Orders vs orders, capitalisation, etc.) have shifted
 * across releases in ways that are hard to pin down without compiling
 * against the real jar, so this only depends on Razorpay's public HTTP
 * contract (https://razorpay.com/docs/api/orders/create), which is stable.
 */
@Configuration
public class RazorpayConfig {

    @Bean
    public RestClient razorpayRestClient(
            @Value("${app.razorpay.key-id}") String keyId,
            @Value("${app.razorpay.key-secret}") String keySecret) {
        String credentials = keyId + ":" + keySecret;
        String basicAuth = "Basic " + Base64.getEncoder().encodeToString(credentials.getBytes(StandardCharsets.UTF_8));
        return RestClient.builder()
                .baseUrl("https://api.razorpay.com/v1")
                .defaultHeader("Authorization", basicAuth)
                .build();
    }
}
