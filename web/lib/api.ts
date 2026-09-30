import "server-only";
import { headers } from "next/headers";
import type {
  OilSummary, OilDetail, Packaging, ProductDetail, Review,
  ShopFacets, ShopQuery, VariantCard, Page,
} from "./types";

class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

/**
 * Same-origin by default, which is what makes `npm run dev` work with zero
 * setup: the request hits this app's own /api/catalogue/** route handlers
 * (backed by lib/catalogue.ts + lib/data.ts). Set NEXT_PUBLIC_API_URL to
 * point every one of these calls at the real Spring Boot service instead —
 * nothing else in the app changes, because the JSON shape is identical.
 */
async function resolveBase(): Promise<string> {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  // Only trust "https" when something in front of this server (a real proxy
  // or load balancer) says so via x-forwarded-proto. The previous fallback —
  // "http" for literally "localhost", "https" for every other hostname —
  // broke any plain `next dev` server reached by anything other than that
  // exact string: a LAN IP (192.168.1.x), a hostname, ngrok without the
  // header set, etc. All of those are still plain HTTP, so self-fetches
  // attempted a TLS handshake against a server that was never listening for
  // one and failed outright. Default to http unless told otherwise.
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

async function get<T>(path: string, revalidate = 300): Promise<T> {
  const base = await resolveBase();
  const res = await fetch(`${base}/api/catalogue${path}`, {
    headers: { Accept: "application/json" },
    next: { revalidate, tags: ["catalogue"] },
  });
  if (!res.ok) throw new ApiError(res.status, `GET ${path} failed: ${res.status}`);
  return res.json() as Promise<T>;
}

function qs(query: ShopQuery): string {
  const p = new URLSearchParams();
  query.oil?.forEach((o) => p.append("oil", o));
  query.pack?.forEach((k) => p.append("pack", k));
  if (query.minPrice != null) p.set("minPrice", String(query.minPrice));
  if (query.maxPrice != null) p.set("maxPrice", String(query.maxPrice));
  if (query.q) p.set("q", query.q);
  if (query.inStock) p.set("inStock", "true");
  if (query.sort) p.set("sort", query.sort);
  p.set("page", String(query.page ?? 0));
  p.set("size", String(query.size ?? 24));
  return p.toString();
}

export const api = {
  oils: () => get<OilSummary[]>("/oils"),
  oil: (slug: string) => get<OilDetail>(`/oils/${slug}`),
  packagings: () => get<Packaging[]>("/packagings"),
  facets: () => get<ShopFacets>("/facets"),
  featured: (limit = 8) => get<VariantCard[]>(`/featured?limit=${limit}`, 60),
  variants: (query: ShopQuery = {}) => get<Page<VariantCard>>(`/variants?${qs(query)}`, 60),
  product: (slug: string) => get<ProductDetail>(`/products/${slug}`),
  reviews: (productId: string) => get<Page<Review>>(`/products/${productId}/reviews`, 120),
  related: (productId: string, limit = 4) => get<VariantCard[]>(`/products/${productId}/related?limit=${limit}`, 300),
};

export { ApiError };
