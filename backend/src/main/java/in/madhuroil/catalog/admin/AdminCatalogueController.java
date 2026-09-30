package in.madhuroil.catalog.admin;

import in.madhuroil.catalog.domain.*;
import in.madhuroil.catalog.dto.AdminCatalogueDtos.*;
import in.madhuroil.catalog.repo.*;
import in.madhuroil.catalog.service.AdminCatalogueMapper;
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
import java.util.stream.Collectors;

/**
 * Admin writes. This is the whole point of the data model: the mill adds an oil,
 * a pack, a product or a variant here and the storefront picks it up on the
 * next cache tick — see product/add-remove-guide in ADMIN_GUIDE.md at the repo
 * root for the walkthrough a non-engineer admin would follow.
 *
 * Every list/create/update endpoint returns a flat DTO (AdminCatalogueDtos),
 * never the JPA entity directly — application.yml turns off open-in-view on
 * purpose ("each request explicitly loads what it needs"), so a lazy relation
 * touched by Jackson after the transaction closes would blow up. Mapping to a
 * DTO inside the transactional method sidesteps that entirely.
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
    private final AdminCatalogueMapper map;

    // ================= oils =================

    public record OilForm(@NotBlank String name, @NotBlank String slug, String tagline, String description,
                          @Pattern(regexp = "^#([0-9a-fA-F]{6})$") String oilColor, String seedColor,
                          String heroImageUrl, List<String> features, Integer sortOrder, Boolean active) {}

    @GetMapping("/oils")
    @Transactional(readOnly = true)
    public List<AdminOilDto> listOils() {
        List<Product> allProducts = products.findAllByOrderBySortOrderAsc();
        Map<UUID, Long> activeProductCountByOil = allProducts.stream()
                .filter(Product::isActive)
                .collect(Collectors.groupingBy(p -> p.getOilCategory().getId(), Collectors.counting()));
        return oils.findAllByOrderBySortOrderAsc().stream()
                .map(o -> map.toDto(o, activeProductCountByOil.getOrDefault(o.getId(), 0L).intValue()))
                .toList();
    }

    @PostMapping("/oils")
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    public AdminOilDto createOil(@Valid @RequestBody OilForm f) {
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
        return map.toDto(saved, 0);
    }

    @PutMapping("/oils/{id}")
    @Transactional
    public AdminOilDto updateOil(@PathVariable UUID id, @Valid @RequestBody OilForm f) {
        OilCategory o = oils.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (!o.getSlug().equals(f.slug()) && oils.existsBySlug(f.slug()))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Slug already used");
        o.setName(f.name()); o.setSlug(f.slug()); o.setTagline(f.tagline());
        o.setDescription(f.description()); o.setOilColor(f.oilColor()); o.setSeedColor(f.seedColor());
        if (f.heroImageUrl() != null) o.setHeroImageUrl(f.heroImageUrl());
        if (f.sortOrder() != null) o.setSortOrder(f.sortOrder());
        if (f.active() != null) o.setActive(f.active());
        catalogue.invalidateCatalogueCaches();
        int activeProducts = (int) products.findAllByOrderBySortOrderAsc().stream()
                .filter(p -> p.isActive() && p.getOilCategory().getId().equals(id)).count();
        return map.toDto(o, activeProducts);
    }

    /** Soft delete only — an oil with historic orders must stay resolvable.
     *  PUT the same oil back with active:true to bring it back. */
    @DeleteMapping("/oils/{id}")
    @Transactional
    public void retireOil(@PathVariable UUID id) {
        oils.findById(id).ifPresent(o -> o.setActive(false));
        catalogue.invalidateCatalogueCaches();
    }

    // ================= packaging =================

    public record PackagingForm(@NotBlank String name, @NotBlank String code,
                                @NotNull Packaging.Kind kind, @NotNull BigDecimal size,
                                @NotNull Packaging.Unit unit, BigDecimal grossWeightKg,
                                Integer sortOrder, Boolean active) {}

    @GetMapping("/packagings")
    @Transactional(readOnly = true)
    public List<AdminPackagingDto> listPackagings() {
        return packagings.findAllByOrderBySortOrderAsc().stream().map(map::toDto).toList();
    }

    @PostMapping("/packagings")
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    public AdminPackagingDto createPackaging(@Valid @RequestBody PackagingForm f) {
        if (packagings.findByCode(f.code()).isPresent())
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Code already used");
        Packaging p = Packaging.builder()
                .name(f.name()).code(f.code()).kind(f.kind()).size(f.size()).unit(f.unit())
                .grossWeightKg(f.grossWeightKg())
                .sortOrder(f.sortOrder() == null ? 100 : f.sortOrder())
                .active(f.active() == null || f.active())
                .build();
        Packaging saved = packagings.save(p);
        catalogue.invalidateCatalogueCaches();
        return map.toDto(saved);
    }

    @PutMapping("/packagings/{id}")
    @Transactional
    public AdminPackagingDto updatePackaging(@PathVariable UUID id, @Valid @RequestBody PackagingForm f) {
        Packaging p = packagings.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        p.setName(f.name()); p.setCode(f.code()); p.setKind(f.kind()); p.setSize(f.size()); p.setUnit(f.unit());
        if (f.grossWeightKg() != null) p.setGrossWeightKg(f.grossWeightKg());
        if (f.sortOrder() != null) p.setSortOrder(f.sortOrder());
        if (f.active() != null) p.setActive(f.active());
        catalogue.invalidateCatalogueCaches();
        return map.toDto(p);
    }

    /** Soft delete — existing variants keep referencing this packaging for
     *  order history; it just stops showing up as an option for new variants. */
    @DeleteMapping("/packagings/{id}")
    @Transactional
    public void retirePackaging(@PathVariable UUID id) {
        packagings.findById(id).ifPresent(p -> p.setActive(false));
        catalogue.invalidateCatalogueCaches();
    }

    // ================= products =================

    public record ProductForm(@NotNull UUID oilCategoryId, @NotBlank String name, @NotBlank String slug,
                              String shortDescription, String description,
                              String extractionMethod, Integer shelfLifeMonths, String madeAt,
                              Boolean featured, Integer sortOrder, Boolean active) {}

    @GetMapping("/products")
    @Transactional(readOnly = true)
    public List<AdminProductDto> listProducts() {
        return products.findAllByOrderBySortOrderAsc().stream().map(map::toDto).toList();
    }

    @PostMapping("/products")
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    public AdminProductDto createProduct(@Valid @RequestBody ProductForm f) {
        if (products.existsBySlug(f.slug())) throw new ResponseStatusException(HttpStatus.CONFLICT, "Slug already used");
        OilCategory oil = oils.findById(f.oilCategoryId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown oil category"));
        Product p = Product.builder()
                .oilCategory(oil).name(f.name()).slug(f.slug())
                .shortDescription(f.shortDescription()).description(f.description())
                .extractionMethod(f.extractionMethod()).shelfLifeMonths(f.shelfLifeMonths()).madeAt(f.madeAt())
                .featured(f.featured() != null && f.featured())
                .sortOrder(f.sortOrder() == null ? 100 : f.sortOrder())
                .active(f.active() == null || f.active())
                .build();
        Product saved = products.save(p);
        catalogue.invalidateCatalogueCaches();
        return map.toDto(saved);
    }

    @PutMapping("/products/{id}")
    @Transactional
    public AdminProductDto updateProduct(@PathVariable UUID id, @Valid @RequestBody ProductForm f) {
        Product p = products.findByIdWithOilCategory(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (!p.getSlug().equals(f.slug()) && products.existsBySlug(f.slug()))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Slug already used");
        if (!p.getOilCategory().getId().equals(f.oilCategoryId())) {
            OilCategory oil = oils.findById(f.oilCategoryId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown oil category"));
            p.setOilCategory(oil);
        }
        p.setName(f.name()); p.setSlug(f.slug());
        p.setShortDescription(f.shortDescription()); p.setDescription(f.description());
        p.setExtractionMethod(f.extractionMethod()); p.setShelfLifeMonths(f.shelfLifeMonths()); p.setMadeAt(f.madeAt());
        if (f.featured() != null) p.setFeatured(f.featured());
        if (f.sortOrder() != null) p.setSortOrder(f.sortOrder());
        if (f.active() != null) p.setActive(f.active());
        catalogue.invalidateCatalogueCaches();
        return map.toDto(p);
    }

    /** Soft delete — cascades to nothing; existing variants (and any orders
     *  referencing them) stay exactly as they were, they just stop being
     *  offered for sale because the product they hang off is no longer active. */
    @DeleteMapping("/products/{id}")
    @Transactional
    public void retireProduct(@PathVariable UUID id) {
        products.findById(id).ifPresent(p -> p.setActive(false));
        catalogue.invalidateCatalogueCaches();
    }

    // ================= variants =================

    public record VariantForm(@NotNull UUID productId, @NotNull UUID packagingId,
                              String sku, @NotNull @DecimalMin("0.00") BigDecimal price, BigDecimal mrp,
                              @Min(0) Integer stock, Integer lowStockThreshold,
                              String batchCode, Boolean active) {}

    @GetMapping("/variants")
    @Transactional(readOnly = true)
    public List<AdminVariantDto> listVariants() {
        return map.toVariantDtos(variants.findAllForAdmin());
    }

    @PostMapping("/variants")
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    public AdminVariantDto createVariant(@Valid @RequestBody VariantForm f) {
        Product product = products.findByIdWithOilCategory(f.productId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown product"));
        Packaging pack = packagings.findById(f.packagingId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown packaging"));

        String sku = (f.sku() == null || f.sku().isBlank()) ? generateSku(product, pack) : f.sku();
        if (variants.existsBySku(sku)) throw new ResponseStatusException(HttpStatus.CONFLICT, "SKU already used");

        ProductVariant v = ProductVariant.builder()
                .product(product).packaging(pack)
                .sku(sku)
                .price(f.price()).mrp(f.mrp())
                .stock(f.stock() == null ? 0 : f.stock())
                .lowStockThreshold(f.lowStockThreshold() == null ? 10 : f.lowStockThreshold())
                .batchCode(f.batchCode())
                .active(f.active() == null || f.active())
                .build();
        ProductVariant saved = variants.save(v);
        catalogue.invalidateCatalogueCaches();
        return map.toDto(saved);
    }

    /** Full edit — price, MRP, stock, threshold, batch, active. For a quick
     *  stock-only bump, PATCH .../stock below stays the lighter-weight option. */
    @PutMapping("/variants/{id}")
    @Transactional
    public AdminVariantDto updateVariant(@PathVariable UUID id, @Valid @RequestBody VariantForm f) {
        ProductVariant v = variants.findByIdForAdmin(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (!v.getProduct().getId().equals(f.productId())) {
            Product product = products.findByIdWithOilCategory(f.productId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown product"));
            v.setProduct(product);
        }
        if (!v.getPackaging().getId().equals(f.packagingId())) {
            Packaging pack = packagings.findById(f.packagingId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown packaging"));
            v.setPackaging(pack);
        }
        if (f.sku() != null && !f.sku().isBlank() && !f.sku().equals(v.getSku())) {
            if (variants.existsBySku(f.sku())) throw new ResponseStatusException(HttpStatus.CONFLICT, "SKU already used");
            v.setSku(f.sku());
        }
        v.setPrice(f.price()); v.setMrp(f.mrp());
        if (f.stock() != null) v.setStock(f.stock());
        if (f.lowStockThreshold() != null) v.setLowStockThreshold(f.lowStockThreshold());
        if (f.batchCode() != null) v.setBatchCode(f.batchCode());
        if (f.active() != null) v.setActive(f.active());
        catalogue.invalidateCatalogueCaches();
        return map.toDto(v);
    }

    @PatchMapping("/variants/{id}/stock")
    @Transactional
    public AdminVariantDto setStock(@PathVariable UUID id, @RequestParam @Min(0) int stock) {
        ProductVariant v = variants.findByIdForAdmin(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        v.setStock(stock);
        catalogue.invalidateCatalogueCaches();
        return map.toDto(v);
    }

    /** Soft delete — stops the variant from being sold; past orders that
     *  reference it are untouched (OrderItem snapshots name/price/SKU). */
    @DeleteMapping("/variants/{id}")
    @Transactional
    public void retireVariant(@PathVariable UUID id) {
        variants.findById(id).ifPresent(v -> v.setActive(false));
        catalogue.invalidateCatalogueCaches();
    }

    @GetMapping("/inventory/low")
    @Transactional(readOnly = true)
    public List<AdminVariantDto> lowStock(@RequestParam(defaultValue = "10") int threshold) {
        return map.toVariantDtos(variants.findByStockLessThanEqualAndActiveTrue(threshold));
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
