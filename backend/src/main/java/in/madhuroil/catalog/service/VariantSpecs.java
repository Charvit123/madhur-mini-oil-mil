package in.madhuroil.catalog.service;

import in.madhuroil.catalog.domain.ProductVariant;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.*;

/**
 * Shop filters as composable Specifications, so /api/catalogue/variants
 * supports any combination of oil, pack, price and search without a
 * hand-written query per permutation.
 */
public final class VariantSpecs {

    public static Specification<ProductVariant> live() {
        return (root, q, cb) -> cb.and(
                cb.isTrue(root.get("active")),
                cb.isTrue(root.get("product").get("active")));
    }

    public static Specification<ProductVariant> oilSlugsIn(Collection<String> slugs) {
        if (slugs == null || slugs.isEmpty()) return null;
        return (root, q, cb) -> root.get("product").get("oilCategory").get("slug").in(slugs);
    }

    public static Specification<ProductVariant> packagingCodesIn(Collection<String> codes) {
        if (codes == null || codes.isEmpty()) return null;
        return (root, q, cb) -> root.get("packaging").get("code").in(codes);
    }

    public static Specification<ProductVariant> priceBetween(BigDecimal min, BigDecimal max) {
        if (min == null && max == null) return null;
        return (root, q, cb) -> {
            if (min == null) return cb.le(root.get("price"), max);
            if (max == null) return cb.ge(root.get("price"), min);
            return cb.between(root.get("price"), min, max);
        };
    }

    public static Specification<ProductVariant> inStockOnly(boolean only) {
        return only ? (root, q, cb) -> cb.greaterThan(root.get("stock"), 0) : null;
    }

    /** Matches product name, oil name or SKU — customers paste SKUs off old invoices. */
    public static Specification<ProductVariant> search(String term) {
        if (term == null || term.isBlank()) return null;
        String like = "%" + term.trim().toLowerCase() + "%";
        return (root, q, cb) -> cb.or(
                cb.like(cb.lower(root.get("sku")), like),
                cb.like(cb.lower(root.get("product").get("name")), like),
                cb.like(cb.lower(root.get("product").get("oilCategory").get("name")), like),
                cb.like(cb.lower(root.get("packaging").get("name")), like));
    }

    @SafeVarargs
    public static Specification<ProductVariant> all(Specification<ProductVariant>... specs) {
        Specification<ProductVariant> out = null;
        for (Specification<ProductVariant> s : specs) {
            if (s == null) continue;
            out = (out == null) ? s : out.and(s);
        }
        return out;
    }

    private VariantSpecs() {}
}
