package in.madhuroil.catalog.service;

import in.madhuroil.catalog.domain.*;
import in.madhuroil.catalog.dto.CatalogueDtos.*;
import in.madhuroil.catalog.repo.*;
import in.madhuroil.config.RevalidationClient;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.*;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CatalogueService {

    private final OilCategoryRepo oils;
    private final PackagingRepo packagings;
    private final ProductRepo products;
    private final ProductVariantRepo variants;
    private final ReviewRepo reviews;
    private final CatalogueMapper map;
    private final RevalidationClient revalidation;

    /** Cache these three: they change only when the admin saves. Evict on write. */
    @Cacheable("oils")
    public List<OilSummaryDto> listOils() {
        List<ProductVariant> live = variants.findAllLive();
        Map<UUID, List<ProductVariant>> byOil = live.stream()
                .collect(Collectors.groupingBy(v -> v.getProduct().getOilCategory().getId()));
        return oils.findByActiveTrueOrderBySortOrderAsc().stream()
                .map(o -> map.toSummary(o, byOil.getOrDefault(o.getId(), List.of())))
                .toList();
    }

    @Cacheable("packagings")
    public List<PackagingDto> listPackagings() {
        return packagings.findByActiveTrueOrderBySortOrderAsc().stream().map(map::toDto).toList();
    }

    public OilDetailDto oilBySlug(String slug) {
        OilCategory o = oils.findBySlugAndActiveTrue(slug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No such oil"));
        List<ProductVariant> vs = variants.findAllLive().stream()
                .filter(v -> v.getProduct().getOilCategory().getId().equals(o.getId()))
                .sorted(Comparator.comparingInt(v -> v.getPackaging().getSortOrder()))
                .toList();
        return map.toDetail(o, vs);
    }

    public ProductDetailDto productBySlug(String slug) {
        return products.findBySlugAndActiveTrue(slug).map(map::toDetail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No such product"));
    }

    /** The shop grid. Every filter is optional; sort is whitelisted. */
    public PageDto<VariantCardDto> search(Set<String> oilSlugs, Set<String> packCodes,
                                          BigDecimal minPrice, BigDecimal maxPrice,
                                          String query, boolean inStockOnly,
                                          String sort, int page, int size) {

        Specification<ProductVariant> spec = VariantSpecs.all(
                VariantSpecs.live(),
                VariantSpecs.oilSlugsIn(oilSlugs),
                VariantSpecs.packagingCodesIn(packCodes),
                VariantSpecs.priceBetween(minPrice, maxPrice),
                VariantSpecs.search(query),
                VariantSpecs.inStockOnly(inStockOnly));

        Sort order = switch (sort == null ? "featured" : sort) {
            case "price-asc"  -> Sort.by(Sort.Direction.ASC, "price");
            case "price-desc" -> Sort.by(Sort.Direction.DESC, "price");
            case "rating"     -> Sort.by(Sort.Direction.DESC, "product.ratingAverage");
            case "newest"     -> Sort.by(Sort.Direction.DESC, "createdAt");
            default           -> Sort.by(Sort.Direction.DESC, "stock").and(Sort.by("packaging.sortOrder"));
        };

        Page<ProductVariant> result = variants.findAll(spec, PageRequest.of(page, Math.min(size, 60), order));
        return new PageDto<>(result.map(map::toCard).getContent(),
                result.getNumber(), result.getSize(), result.getTotalElements(), result.getTotalPages());
    }

    public ShopFacetsDto facets() {
        List<ProductVariant> live = variants.findAllLive();
        BigDecimal min = live.stream().map(ProductVariant::getPrice).min(Comparator.naturalOrder()).orElse(BigDecimal.ZERO);
        BigDecimal max = live.stream().map(ProductVariant::getPrice).max(Comparator.naturalOrder()).orElse(BigDecimal.ZERO);
        return new ShopFacetsDto(listOils(), listPackagings(), min, max, live.size());
    }

    public List<VariantCardDto> featured(int limit) {
        return variants.findAllLive().stream()
                .filter(ProductVariant::isInStock)
                .sorted(Comparator.comparingInt(ProductVariant::discountPercent).reversed())
                .limit(limit).map(map::toCard).toList();
    }

    public List<VariantCardDto> relatedTo(UUID productId, int limit) {
        return variants.findAllLive().stream()
                .filter(v -> !v.getProduct().getId().equals(productId) && v.isInStock())
                .limit(limit).map(map::toCard).toList();
    }

    public PageDto<ReviewDto> reviews(UUID productId, int page, int size) {
        Page<Review> p = reviews.findByProductIdAndStatus(productId, Review.Status.PUBLISHED,
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));
        return new PageDto<>(p.map(map::toDto).getContent(), p.getNumber(), p.getSize(),
                p.getTotalElements(), p.getTotalPages());
    }

    @Transactional
    @CacheEvict(cacheNames = {"oils", "packagings"}, allEntries = true)
    public void invalidateCatalogueCaches(String... webTags) {
        revalidation.revalidate(webTags.length > 0 ? webTags : new String[]{"catalogue"});
    }
}
