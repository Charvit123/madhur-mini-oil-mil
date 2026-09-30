import * as db from "./data";
import type { OilDetail, OilSummary, Packaging, ProductDetail, Page, ShopFacets, ShopQuery, VariantCard } from "./types";

/**
 * Pure functions over lib/data.ts, shaped exactly like the Spring service
 * (in.madhuroil.catalog.service.CatalogueService / CatalogueMapper). The
 * route handlers in app/api/catalogue/** are thin wrappers around these —
 * swap this module for real fetch() calls to the Java backend and nothing
 * downstream changes, since the shapes returned here are the DTOs already.
 */

function toPackaging(p: db.RawPackaging): Packaging {
  const label = `${Number(p.size)} ${p.unit === "KG" ? "Kg" : p.unit === "LITRE" ? "L" : p.unit === "ML" ? "ml" : "g"}`;
  return { id: p.id, name: p.name, code: p.id, kind: p.type, size: p.size, unit: p.unit, shortLabel: label, sortOrder: p.order };
}

function discountPercent(price: number, mrp: number) {
  return mrp > price ? Math.round((1 - price / mrp) * 100) : 0;
}

function toCard(v: db.RawVariant): VariantCard {
  const product = db.findProductById(v.productId)!;
  const oil = db.findOilById(product.oilId)!;
  const pack = db.findPackaging(v.packagingId)!;
  return {
    id: v.id, sku: v.sku,
    productId: product.id, productName: product.name, productSlug: product.slug, shortDescription: product.short,
    oilId: oil.id, oilName: oil.name, oilSlug: oil.slug, oilColor: oil.oilColor,
    packaging: toPackaging(pack),
    price: v.price, mrp: v.mrp, discountPercent: discountPercent(v.price, v.mrp),
    stock: v.stock, inStock: v.stock > 0, lowStock: v.stock > 0 && v.stock <= 10,
    ratingAverage: product.rating, ratingCount: product.reviews,
  };
}

function toSummary(oil: db.RawOil): OilSummary {
  const vs = db.variantsForOil(oil.id).map(toCard);
  const packs = [...new Set(vs.map((v) => v.packaging.name))];
  return {
    id: oil.id, name: oil.name, slug: oil.slug, tagline: oil.tagline,
    oilColor: oil.oilColor, seedColor: oil.seedColor,
    variantCount: vs.length,
    priceFrom: vs.length ? Math.min(...vs.map((v) => v.price)) : undefined,
    packLabels: packs,
  };
}

export function listOils(): OilSummary[] {
  return [...db.oils].sort((a, b) => a.order - b.order).map(toSummary);
}

export function listPackagings(): Packaging[] {
  return [...db.packagings].sort((a, b) => a.order - b.order).map(toPackaging);
}

export function getOil(slug: string): OilDetail | undefined {
  const oil = db.findOil(slug);
  if (!oil) return undefined;
  const vs = db.variantsForOil(oil.id)
    .sort((a, b) => db.findPackaging(a.packagingId)!.order - db.findPackaging(b.packagingId)!.order)
    .map(toCard);
  return {
    id: oil.id, name: oil.name, slug: oil.slug, tagline: oil.tagline, description: oil.description,
    oilColor: oil.oilColor, seedColor: oil.seedColor,
    features: oil.features,
    benefits: oil.benefits.map(([title, body]) => ({ title, body })),
    faqs: oil.faqs.map(([question, answer]) => ({ question, answer })),
    variants: vs,
  };
}

export function getProduct(slug: string): ProductDetail | undefined {
  const product = db.findProduct(slug);
  if (!product) return undefined;
  const oil = db.findOilById(product.oilId)!;
  const vs = db.variantsForProduct(product.id)
    .sort((a, b) => db.findPackaging(a.packagingId)!.order - db.findPackaging(b.packagingId)!.order)
    .map(toCard);
  const defaultVariant = vs.find((v) => v.inStock)?.id ?? vs[0]?.id;
  return {
    id: product.id, name: product.name, slug: product.slug, shortDescription: product.short,
    description: `${oil.description} ${product.short}`,
    oil: toSummary(oil),
    specs: [
      { key: "Oil", value: oil.name },
      { key: "Extraction", value: "Mechanical press, filtered" },
      { key: "Shelf life", value: "9 months from pressing" },
      { key: "Storage", value: "Cool, dark, away from direct sunlight" },
      { key: "Made at", value: product.madeAt },
      { key: "FSSAI", value: "10012345678901" },
    ],
    extractionMethod: "Mechanical press, filtered",
    shelfLifeMonths: 9,
    madeAt: product.madeAt,
    ratingAverage: product.rating, ratingCount: product.reviews,
    variants: vs, defaultVariantId: defaultVariant,
  };
}

export function facets(): ShopFacets {
  const all = db.variants.map(toCard);
  return {
    oils: listOils(),
    packagings: listPackagings(),
    minPrice: Math.min(...all.map((v) => v.price)),
    maxPrice: Math.max(...all.map((v) => v.price)),
    total: all.length,
  };
}

export function searchVariants(query: ShopQuery): Page<VariantCard> {
  let list = db.variants.map(toCard);

  if (query.oil?.length) list = list.filter((v) => query.oil!.includes(v.oilSlug));
  if (query.pack?.length) list = list.filter((v) => query.pack!.includes(v.packaging.code));
  if (query.minPrice != null) list = list.filter((v) => v.price >= query.minPrice!);
  if (query.maxPrice != null) list = list.filter((v) => v.price <= query.maxPrice!);
  if (query.inStock) list = list.filter((v) => v.inStock);
  if (query.q) {
    const needle = query.q.toLowerCase();
    list = list.filter((v) =>
      `${v.productName} ${v.sku} ${v.oilName} ${v.packaging.name}`.toLowerCase().includes(needle));
  }

  const sorters: Record<string, (a: VariantCard, b: VariantCard) => number> = {
    "price-asc": (a, b) => a.price - b.price,
    "price-desc": (a, b) => b.price - a.price,
    rating: (a, b) => b.ratingAverage - a.ratingAverage,
    newest: (a, b) => b.id.localeCompare(a.id),
    featured: (a, b) => Number(b.inStock) - Number(a.inStock) || b.discountPercent - a.discountPercent,
  };
  list = [...list].sort(sorters[query.sort ?? "featured"]);

  const size = Math.min(query.size ?? 24, 60);
  const page = query.page ?? 0;
  const start = page * size;
  const items = list.slice(start, start + size);

  return { items, page, size, total: list.length, totalPages: Math.ceil(list.length / size) };
}

export function featured(limit = 8): VariantCard[] {
  return db.variants.map(toCard)
    .filter((v) => v.inStock)
    .sort((a, b) => b.discountPercent - a.discountPercent)
    .slice(0, limit);
}

export function related(productId: string, limit = 4): VariantCard[] {
  return db.variants.map(toCard)
    .filter((v) => v.productId !== productId && v.inStock)
    .slice(0, limit);
}

export function reviewsForProduct(productId: string): Page<import("./types").Review> {
  const items = db.reviewsForProduct(productId).map((r) => ({
    id: r.id, authorName: r.name, city: r.city, rating: r.rating,
    body: r.text, verifiedPurchase: true, createdAt: r.date,
  }));
  return { items, page: 0, size: items.length, total: items.length, totalPages: 1 };
}
