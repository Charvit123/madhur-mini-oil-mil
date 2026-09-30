package in.madhuroil.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.boot.autoconfigure.cache.CacheManagerCustomizer;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.TimeUnit;

/**
 * Backs @Cacheable("oils") / @Cacheable("packagings") in CatalogueService.
 * Five minute TTL as a safety net; the real invalidation path is
 * RevalidationClient firing after every admin write, not this timer.
 */
@Configuration
public class CacheConfig {

    @Bean
    public CacheManagerCustomizer<CaffeineCacheManager> caffeineCustomizer() {
        return cacheManager -> cacheManager.setCaffeine(
            Caffeine.newBuilder()
                .maximumSize(500)
                .expireAfterWrite(5, TimeUnit.MINUTES));
    }
}
