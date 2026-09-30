export type PackagingKind = "TIN" | "BUCKET" | "JAR" | "BOTTLE" | "POUCH" | "CARTON";
export type Unit = "KG" | "LITRE" | "ML" | "GRAM";

export interface Packaging {
  id: string;
  name: string;
  code: string;
  kind: PackagingKind;
  size: number;
  unit: Unit;
  shortLabel: string;
  sortOrder: number;
}

export interface OilSummary {
  id: string;
  name: string;
  slug: string;
  tagline?: string;
  oilColor: string;
  seedColor?: string;
  variantCount: number;
  priceFrom?: number;
  packLabels: string[];
}

export interface TitleBody { title: string; body: string }
export interface Faq { question: string; answer: string }

export interface OilDetail extends Omit<OilSummary, "variantCount" | "priceFrom" | "packLabels"> {
  description?: string;
  features: string[];
  benefits: TitleBody[];
  faqs: Faq[];
  variants: VariantCard[];
}

export interface VariantCard {
  id: string;
  sku: string;
  productId: string;
  productName: string;
  productSlug: string;
  shortDescription?: string;
  oilId: string;
  oilName: string;
  oilSlug: string;
  oilColor: string;
  packaging: Packaging;
  price: number;
  mrp?: number;
  discountPercent: number;
  stock: number;
  inStock: boolean;
  lowStock: boolean;
  ratingAverage: number;
  ratingCount: number;
}

export interface ProductDetail {
  id: string;
  name: string;
  slug: string;
  shortDescription?: string;
  description?: string;
  oil: OilSummary;
  specs: { key: string; value: string }[];
  extractionMethod?: string;
  shelfLifeMonths?: number;
  madeAt?: string;
  ratingAverage: number;
  ratingCount: number;
  variants: VariantCard[];
  defaultVariantId?: string;
}

export interface Review {
  id: string; authorName: string; city?: string; rating: number;
  body?: string; verifiedPurchase: boolean; createdAt: string;
}

export interface ShopFacets {
  oils: OilSummary[];
  packagings: Packaging[];
  minPrice: number;
  maxPrice: number;
  total: number;
}

export interface Page<T> { items: T[]; page: number; size: number; total: number; totalPages: number }

export interface ShopQuery {
  oil?: string[];
  pack?: string[];
  minPrice?: number;
  maxPrice?: number;
  q?: string;
  inStock?: boolean;
  sort?: "featured" | "price-asc" | "price-desc" | "rating" | "newest";
  page?: number;
  size?: number;
}
