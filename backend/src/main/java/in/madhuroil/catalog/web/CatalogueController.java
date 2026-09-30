package in.madhuroil.catalog.web;

import in.madhuroil.catalog.dto.CatalogueDtos.*;
import in.madhuroil.catalog.service.CatalogueService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.Duration;
import java.util.*;

/**
 * Public read API. Everything the storefront renders comes from here, which is
 * what keeps oil names and pack sizes out of the frontend bundle.
 *
 *  GET /api/catalogue/oils
 *  GET /api/catalogue/oils/{slug}
 *  GET /api/catalogue/packagings
 *  GET /api/catalogue/facets
 *  GET /api/catalogue/variants?oil=groundnut-oil&pack=TIN-15KG&sort=price-asc&page=0
 *  GET /api/catalogue/products/{slug}
 *  GET /api/catalogue/products/{id}/reviews
 */
@RestController
@RequestMapping("/api/catalogue")
@RequiredArgsConstructor
public class CatalogueController {

    private final CatalogueService service;

    private static final CacheControl SHORT = CacheControl.maxAge(Duration.ofMinutes(5)).cachePublic();

    @GetMapping("/oils")
    public ResponseEntity<List<OilSummaryDto>> oils() {
        return ResponseEntity.ok().cacheControl(SHORT).body(service.listOils());
    }

    @GetMapping("/oils/{slug}")
    public ResponseEntity<OilDetailDto> oil(@PathVariable String slug) {
        return ResponseEntity.ok().cacheControl(SHORT).body(service.oilBySlug(slug));
    }

    @GetMapping("/packagings")
    public ResponseEntity<List<PackagingDto>> packagings() {
        return ResponseEntity.ok().cacheControl(SHORT).body(service.listPackagings());
    }

    @GetMapping("/facets")
    public ShopFacetsDto facets() { return service.facets(); }

    @GetMapping("/variants")
    public PageDto<VariantCardDto> variants(
            @RequestParam(required = false) Set<String> oil,
            @RequestParam(required = false) Set<String> pack,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "false") boolean inStock,
            @RequestParam(defaultValue = "featured") String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "24") int size) {
        return service.search(oil, pack, minPrice, maxPrice, q, inStock, sort, page, size);
    }

    @GetMapping("/featured")
    public List<VariantCardDto> featured(@RequestParam(defaultValue = "8") int limit) {
        return service.featured(limit);
    }

    @GetMapping("/products/{slug}")
    public ProductDetailDto product(@PathVariable String slug) { return service.productBySlug(slug); }

    @GetMapping("/products/{id}/reviews")
    public PageDto<ReviewDto> reviews(@PathVariable UUID id,
                                      @RequestParam(defaultValue = "0") int page,
                                      @RequestParam(defaultValue = "10") int size) {
        return service.reviews(id, page, size);
    }

    @GetMapping("/products/{id}/related")
    public List<VariantCardDto> related(@PathVariable UUID id,
                                        @RequestParam(defaultValue = "4") int limit) {
        return service.relatedTo(id, limit);
    }
}
