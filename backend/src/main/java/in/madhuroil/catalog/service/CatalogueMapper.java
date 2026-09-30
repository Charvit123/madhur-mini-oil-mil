package in.madhuroil.catalog.service;

import in.madhuroil.catalog.domain.*;
import in.madhuroil.catalog.dto.CatalogueDtos.*;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Component
public class CatalogueMapper {

    public PackagingDto toDto(Packaging p) {
        return new PackagingDto(p.getId(), p.getName(), p.getCode(), p.getKind().name(),
                p.getSize(), p.getUnit().name(), p.shortLabel(), p.getSortOrder());
    }

    public VariantCardDto toCard(ProductVariant v) {
        Product p = v.getProduct();
        OilCategory o = p.getOilCategory();
        return new VariantCardDto(
                v.getId(), v.getSku(),
                p.getId(), p.getName(), p.getSlug(), p.getShortDescription(),
                o.getId(), o.getName(), o.getSlug(), o.getOilColor(),
                toDto(v.getPackaging()),
                v.getPrice(), v.getMrp(), v.discountPercent(),
                v.getStock(), v.isInStock(), v.isLowStock(),
                p.getRatingAverage(), p.getRatingCount(),
                List.copyOf(v.getImageUrls()));
    }

    public OilSummaryDto toSummary(OilCategory o, List<ProductVariant> variants) {
        BigDecimal from = variants.stream().map(ProductVariant::getPrice)
                .min(Comparator.naturalOrder()).orElse(null);
        List<String> packs = variants.stream()
                .sorted(Comparator.comparingInt(v -> v.getPackaging().getSortOrder()))
                .map(v -> v.getPackaging().getName()).distinct().toList();
        return new OilSummaryDto(o.getId(), o.getName(), o.getSlug(), o.getTagline(),
                o.getOilColor(), o.getSeedColor(), o.getHeroImageUrl(),
                variants.size(), from, packs);
    }

    public OilDetailDto toDetail(OilCategory o, List<ProductVariant> variants) {
        return new OilDetailDto(o.getId(), o.getName(), o.getSlug(), o.getTagline(), o.getDescription(),
                o.getOilColor(), o.getSeedColor(), o.getHeroImageUrl(),
                List.copyOf(o.getFeatures()),
                o.getBenefits().stream().map(b -> new TitleBodyDto(b.getTitle(), b.getBody())).toList(),
                o.getFaqs().stream().map(f -> new FaqDto(f.getQuestion(), f.getAnswer())).toList(),
                variants.stream().map(this::toCard).toList(),
                new SeoDto(o.getMetaTitle(), o.getMetaDescription()));
    }

    public ProductDetailDto toDetail(Product p) {
        List<VariantCardDto> cards = p.getVariants().stream()
                .filter(ProductVariant::isActive)
                .sorted(Comparator.comparingInt(v -> v.getPackaging().getSortOrder()))
                .map(this::toCard).toList();

        // default to the first pack actually on the shelf, else the first listed
        UUID defaultVariant = cards.stream().filter(VariantCardDto::inStock)
                .map(VariantCardDto::id).findFirst()
                .orElse(cards.isEmpty() ? null : cards.get(0).id());

        return new ProductDetailDto(p.getId(), p.getName(), p.getSlug(),
                p.getShortDescription(), p.getDescription(),
                toSummary(p.getOilCategory(), p.getVariants()),
                p.getSpecs().stream().map(s -> new SpecDto(s.getKey(), s.getValue())).toList(),
                p.getExtractionMethod(), p.getShelfLifeMonths(), p.getMadeAt(),
                p.getRatingAverage(), p.getRatingCount(),
                cards, defaultVariant,
                new SeoDto(p.getName() + " | Madhur Mini Oil Mill", p.getShortDescription()));
    }

    public ReviewDto toDto(Review r) {
        return new ReviewDto(r.getId(), r.getAuthorName(), r.getCity(), r.getRating(),
                r.getTitle(), r.getBody(), r.isVerifiedPurchase(), r.getCreatedAt().toString());
    }
}
