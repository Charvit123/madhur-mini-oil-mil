package in.madhuroil.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

/**
 * The other half of the cache-eviction loop: after CatalogueService evicts its
 * local Caffeine cache, this tells Next.js to drop the matching fetch tags too
 * (see web/app/revalidate/route.ts), so an admin edit shows up on the storefront
 * without a redeploy on either side.
 */
@Component
public class RevalidationClient {

    private final RestClient http;
    private final String secret;

    public RevalidationClient(
            @Value("${app.revalidate.web-url}") String webUrl,
            @Value("${app.revalidate.secret}") String secret) {
        this.http = RestClient.builder().baseUrl(webUrl).build();
        this.secret = secret;
    }

    public void revalidate(String... tags) {
        try {
            http.post()
                .uri("/revalidate")
                .header("x-revalidate-secret", secret)
                .body(Map.of("tags", List.of(tags)))
                .retrieve()
                .toBodilessEntity();
        } catch (Exception ignored) {
            // Frontend cache TTL (5 min, see application.yml) is the fallback —
            // a failed webhook should never fail the admin's save.
        }
    }
}
