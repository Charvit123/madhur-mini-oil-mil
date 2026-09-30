package in.madhuroil.catalog.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * Admin-facing wire shapes — deliberately flat, unlike the entities they're
 * built from. `open-in-view` is off (see application.yml), so anything with
 * a lazy relation must be mapped to a DTO inside the transactional service
 * method, never handed to Jackson as a raw entity. See AdminCatalogueMapper.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public final class AdminCatalogueDtos {

    public record AdminOilDto(
            UUID id, String name, String slug, String tagline, String description,
            String oilColor, String seedColor, int sortOrder, boolean active, int productCount) {}

    public record AdminPackagingDto(
            UUID id, String name, String code, String kind, BigDecimal size, String unit,
            String shortLabel, int sortOrder, boolean active) {}

    public record AdminProductDto(
            UUID id, String name, String slug, String shortDescription, String description,
            UUID oilCategoryId, String oilCategoryName,
            boolean active, boolean featured, int sortOrder, int variantCount) {}

    public record AdminVariantDto(
            UUID id, String sku,
            UUID productId, String productName,
            UUID oilCategoryId, String oilCategoryName,
            UUID packagingId, String packagingName,
            BigDecimal price, BigDecimal mrp, int stock, int lowStockThreshold,
            String batchCode, boolean active, Instant updatedAt) {}

    private AdminCatalogueDtos() {}
}
