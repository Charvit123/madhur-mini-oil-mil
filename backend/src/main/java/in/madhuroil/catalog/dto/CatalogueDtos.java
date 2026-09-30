package in.madhuroil.catalog.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * Wire shapes. These are the contract the Next.js app codes against — the
 * entities above never leave the service layer. Field names here match
 * web/lib/types.ts one for one.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public final class CatalogueDtos {

    public record PackagingDto(
            UUID id, String name, String code, String kind,   // TIN | BUCKET | JAR | BOTTLE | POUCH
            BigDecimal size, String unit, String shortLabel, int sortOrder) {}

    public record OilSummaryDto(
            UUID id, String name, String slug, String tagline,
            String oilColor, String seedColor, String heroImageUrl,
            int variantCount, BigDecimal priceFrom, List<String> packLabels) {}

    public record OilDetailDto(
            UUID id, String name, String slug, String tagline, String description,
            String oilColor, String seedColor, String heroImageUrl,
            List<String> features, List<TitleBodyDto> benefits, List<FaqDto> faqs,
            List<VariantCardDto> variants, SeoDto seo) {}

    public record TitleBodyDto(String title, String body) {}
    public record FaqDto(String question, String answer) {}
    public record SeoDto(String title, String description) {}

    /** Everything a ProductCard needs, flattened so the grid does zero joins. */
    public record VariantCardDto(
            UUID id, String sku,
            UUID productId, String productName, String productSlug, String shortDescription,
            UUID oilId, String oilName, String oilSlug, String oilColor,
            PackagingDto packaging,
            BigDecimal price, BigDecimal mrp, int discountPercent,
            int stock, boolean inStock, boolean lowStock,
            BigDecimal ratingAverage, int ratingCount,
            List<String> imageUrls) {}

    public record ProductDetailDto(
            UUID id, String name, String slug, String shortDescription, String description,
            OilSummaryDto oil,
            List<SpecDto> specs, String extractionMethod, Integer shelfLifeMonths, String madeAt,
            BigDecimal ratingAverage, int ratingCount,
            List<VariantCardDto> variants,
            UUID defaultVariantId,
            SeoDto seo) {}

    public record SpecDto(String key, String value) {}

    public record BatchDto(String batchCode, LocalDate pressedOn, LocalDate bestBefore) {}

    public record ReviewDto(
            UUID id, String authorName, String city, int rating,
            String title, String body, boolean verifiedPurchase, String createdAt) {}

    /** Drives the shop page filter rails without the client deriving anything. */
    public record ShopFacetsDto(
            List<OilSummaryDto> oils, List<PackagingDto> packagings,
            BigDecimal minPrice, BigDecimal maxPrice, long total) {}

    public record PageDto<T>(List<T> items, int page, int size, long total, int totalPages) {}

    private CatalogueDtos() {}
}
