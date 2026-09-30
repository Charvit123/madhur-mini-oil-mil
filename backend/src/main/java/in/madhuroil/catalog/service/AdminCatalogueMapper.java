package in.madhuroil.catalog.service;

import in.madhuroil.catalog.domain.*;
import in.madhuroil.catalog.dto.AdminCatalogueDtos.*;
import org.springframework.stereotype.Component;

import java.util.List;

/** Entity -> admin DTO, called from within a transactional method so any
 *  lazy relation touched here is still backed by an open session. */
@Component
public class AdminCatalogueMapper {

    public AdminOilDto toDto(OilCategory o, int productCount) {
        return new AdminOilDto(o.getId(), o.getName(), o.getSlug(), o.getTagline(), o.getDescription(),
                o.getOilColor(), o.getSeedColor(), o.getSortOrder(), o.isActive(), productCount);
    }

    public AdminPackagingDto toDto(Packaging p) {
        return new AdminPackagingDto(p.getId(), p.getName(), p.getCode(), p.getKind().name(),
                p.getSize(), p.getUnit().name(), p.shortLabel(), p.getSortOrder(), p.isActive());
    }

    public AdminProductDto toDto(Product p) {
        return new AdminProductDto(p.getId(), p.getName(), p.getSlug(), p.getShortDescription(), p.getDescription(),
                p.getOilCategory().getId(), p.getOilCategory().getName(),
                p.isActive(), p.isFeatured(), p.getSortOrder(),
                p.getVariants() == null ? 0 : (int) p.getVariants().stream().filter(ProductVariant::isActive).count());
    }

    public AdminVariantDto toDto(ProductVariant v) {
        Product p = v.getProduct();
        Packaging pack = v.getPackaging();
        return new AdminVariantDto(v.getId(), v.getSku(),
                p.getId(), p.getName(),
                p.getOilCategory().getId(), p.getOilCategory().getName(),
                pack.getId(), pack.getName(),
                v.getPrice(), v.getMrp(), v.getStock(), v.getLowStockThreshold(),
                v.getBatchCode(), v.isActive(), v.getUpdatedAt());
    }

    public List<AdminVariantDto> toVariantDtos(List<ProductVariant> vs) {
        return vs.stream().map(this::toDto).toList();
    }
}
