package in.madhuroil.catalog.admin;

import in.madhuroil.catalog.domain.*;
import in.madhuroil.catalog.repo.*;
import in.madhuroil.catalog.service.CatalogueService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.*;

/**
 * Admin writes. This is the whole point of the data model: the mill adds an oil,
 * a pack or a variant here and the storefront picks it up on the next cache tick.
 */
@RestController
@RequestMapping("/api/admin/catalogue")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminCatalogueController {

    private final OilCategoryRepo oils;
    private final PackagingRepo packagings;
    private final ProductRepo products;
    private final ProductVariantRepo variants;
    private final CatalogueService catalogue;

    // ---------- oils ----------
    public record OilForm(@NotBlank String name, @NotBlank String slug, String tagline, String description,
                          @Pattern(regexp = "^#([0-9a-fA-F]{6})$") String oilColor, String seedColor,
                          String heroImageUrl, List<String> features, Integer sortOrder, Boolean active) {}

    @PostMapping("/oils")
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    public OilCategory createOil(@Valid @RequestBody OilForm f) {
        if (oils.existsBySlug(f.slug())) throw new ResponseStatusException(HttpStatus.CONFLICT, "Slug already used");
        OilCategory o = OilCategory.builder()
                .name(f.name()).slug(f.slug()).tagline(f.tagline()).description(f.description())
                .oilColor(f.oilColor()).seedColor(f.seedColor()).heroImageUrl(f.heroImageUrl())
                .features(f.features() == null ? new ArrayList<>() : new ArrayList<>(f.features()))
                .sortOrder(f.sortOrder() == null ? 100 : f.sortOrder())
                .active(f.active() == null || f.active())
                .build();
        OilCategory saved = oils.save(o);
        catalogue.invalidateCatalogueCaches();
        return saved;
    }

    @PutMapping("/oils/{id}")
    @Transactional
    public OilCategory updateOil(@PathVariable UUID id, @Valid @RequestBody OilForm f) {
        OilCategory o = oils.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        o.setName(f.name()); o.setSlug(f.slug()); o.setTagline(f.tagline());
        o.setDescription(f.description()); o.setOilColor(f.oilColor()); o.setSeedColor(f.seedColor());
        if (f.sortOrder() != null) o.setSortOrder(f.sortOrder());
        if (f.active() != null) o.setActive(f.active());
        catalogue.invalidateCatalogueCaches();
        return o;
    }

    /** Soft delete only — an oil with historic orders must stay resolvable. */
    @DeleteMapping("/oils/{id}")
    @Transactional
    public void retireOil(@PathVariable UUID id) {
        oils.findById(id).ifPresent(o -> o.setActive(false));
        catalogue.invalidateCatalogueCaches();
    }

    // ---------- packaging ----------
    public record PackagingForm(@NotBlank String name, @NotBlank String code,
                                @NotNull Packaging.Kind kind, @NotNull BigDecimal size,
                                @NotNull Packaging.Unit unit, BigDecimal grossWeightKg,
                                Integer sortOrder, Boolean active) {}

    @PostMapping("/packagings")
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    public Packaging createPackaging(@Valid @RequestBody PackagingForm f) {
        Packaging p = Packaging.builder()
                .name(f.name()).code(f.code()).kind(f.kind()).size(f.size()).unit(f.unit())
                .grossWeightKg(f.grossWeightKg())
                .sortOrder(f.sortOrder() == null ? 100 : f.sortOrder())
                .active(f.active() == null || f.active())
                .build();
        Packaging saved = packagings.save(p);
        catalogue.invalidateCatalogueCaches();
        return saved;
    }

    // ---------- variants ----------
    public record VariantForm(@NotNull UUID productId, @NotNull UUID packagingId,
                              String sku, @NotNull @DecimalMin("0.00") BigDecimal price, BigDecimal mrp,
                              @Min(0) Integer stock, Integer lowStockThreshold,
                              String batchCode, Boolean active) {}

    @PostMapping("/variants")
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    public ProductVariant createVariant(@Valid @RequestBody VariantForm f) {
        Product product = products.findById(f.productId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown product"));
        Packaging pack = packagings.findById(f.packagingId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown packaging"));

        ProductVariant v = ProductVariant.builder()
                .product(product).packaging(pack)
                .sku(f.sku() == null || f.sku().isBlank() ? generateSku(product, pack) : f.sku())
                .price(f.price()).mrp(f.mrp())
                .stock(f.stock() == null ? 0 : f.stock())
                .lowStockThreshold(f.lowStockThreshold() == null ? 10 : f.lowStockThreshold())
                .batchCode(f.batchCode())
                .active(f.active() == null || f.active())
                .build();
        ProductVariant saved = variants.save(v);
        catalogue.invalidateCatalogueCaches();
        return saved;
    }

    @PatchMapping("/variants/{id}/stock")
    @Transactional
    public ProductVariant setStock(@PathVariable UUID id, @RequestParam @Min(0) int stock) {
        ProductVariant v = variants.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        v.setStock(stock);
        catalogue.invalidateCatalogueCaches();
        return v;
    }

    @GetMapping("/inventory/low")
    public List<ProductVariant> lowStock(@RequestParam(defaultValue = "10") int threshold) {
        return variants.findByStockLessThanEqualAndActiveTrue(threshold);
    }

    /** MDH-GN-DF-15KT style codes, derived rather than typed by hand. */
    private String generateSku(Product product, Packaging pack) {
        String oil = abbreviate(product.getOilCategory().getName(), 2);
        String prod = abbreviate(product.getName(), 2);
        return "MDH-%s-%s-%s".formatted(oil, prod, pack.getCode().replace("-", ""));
    }

    private String abbreviate(String s, int len) {
        String letters = s.replaceAll("[^A-Za-z]", "").toUpperCase(Locale.ROOT);
        return letters.substring(0, Math.min(len, letters.length()));
    }
}
