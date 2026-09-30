import type { OrderDto, OrderPage } from "./order";
import type { AdminUserView } from "./adminAuth";
import type {
  AdminCustomer, AdminOil, AdminPackaging, AdminPayment, AdminProduct,
  AdminReview, AdminVariant, DashboardStats, PackagingKind, Unit,
} from "./types";

export class AdminApiError extends Error {
  constructor(message: string, public status?: number) { super(message); }
}

function backendBase(): string {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) {
    throw new AdminApiError(
      "This needs the real backend. Set NEXT_PUBLIC_API_URL in web/.env.local " +
      "to wherever the Spring Boot service is running (e.g. http://localhost:8080) and restart the dev server."
    );
  }
  return base;
}

async function parseErrorMessage(res: Response): Promise<string> {
  try {
    const body = await res.json();
    return body.message || body.error || `Request failed (${res.status})`;
  } catch {
    return `Request failed (${res.status})`;
  }
}

async function authedFetch(path: string, token: string, init: RequestInit = {}): Promise<Response> {
  const res = await fetch(`${backendBase()}${path}`, {
    ...init,
    headers: {
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      Authorization: `Bearer ${token}`,
      ...init.headers,
    },
  });
  if (!res.ok) throw new AdminApiError(await parseErrorMessage(res), res.status);
  return res;
}

export async function adminListOrders(token: string, status?: string, page = 0): Promise<OrderPage> {
  const params = new URLSearchParams({ page: String(page), size: "20" });
  if (status) params.set("status", status);
  const res = await authedFetch(`/api/admin/orders?${params}`, token);
  return res.json();
}

export async function adminUpdateOrderStatus(token: string, orderId: string, status: string): Promise<OrderDto> {
  const res = await authedFetch(`/api/admin/orders/${orderId}/status`, token, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  return res.json();
}

export async function adminRefundOrder(token: string, orderId: string): Promise<OrderDto> {
  const res = await authedFetch(`/api/admin/orders/${orderId}/refund`, token, { method: "POST" });
  return res.json();
}

// ---- admin-user management (ROLE_SUPER_ADMIN only, enforced server-side) ----

export async function adminListAdmins(token: string): Promise<AdminUserView[]> {
  const res = await authedFetch("/api/admin/admins", token);
  return res.json();
}

export async function adminCreateAdmin(
  token: string,
  form: { username: string; password: string; fullName?: string; role: "ADMIN" | "SUPER_ADMIN" }
): Promise<AdminUserView> {
  const res = await authedFetch("/api/admin/admins", token, { method: "POST", body: JSON.stringify(form) });
  return res.json();
}

export async function adminDeactivate(token: string, id: string): Promise<void> {
  await authedFetch(`/api/admin/admins/${id}/deactivate`, token, { method: "PATCH" });
}

export async function adminReactivate(token: string, id: string): Promise<void> {
  await authedFetch(`/api/admin/admins/${id}/reactivate`, token, { method: "PATCH" });
}

// ---- dashboard ----

export async function adminDashboardStats(token: string): Promise<DashboardStats> {
  const res = await authedFetch("/api/admin/dashboard/stats", token);
  return res.json();
}

// ---- catalogue: oils ----

export interface OilForm {
  name: string; slug: string; tagline?: string; description?: string;
  oilColor: string; seedColor?: string; heroImageUrl?: string;
  sortOrder?: number; active?: boolean;
}

export async function adminListOils(token: string): Promise<AdminOil[]> {
  const res = await authedFetch("/api/admin/catalogue/oils", token);
  return res.json();
}

export async function adminCreateOil(token: string, form: OilForm): Promise<AdminOil> {
  const res = await authedFetch("/api/admin/catalogue/oils", token, { method: "POST", body: JSON.stringify(form) });
  return res.json();
}

export async function adminUpdateOil(token: string, id: string, form: OilForm): Promise<AdminOil> {
  const res = await authedFetch(`/api/admin/catalogue/oils/${id}`, token, { method: "PUT", body: JSON.stringify(form) });
  return res.json();
}

/** Soft delete — retired oils stop showing on the storefront but stay
 *  resolvable for past orders. Reactivate with adminUpdateOil(..., {active:true}). */
export async function adminRetireOil(token: string, id: string): Promise<void> {
  await authedFetch(`/api/admin/catalogue/oils/${id}`, token, { method: "DELETE" });
}

// ---- catalogue: packagings ----

export interface PackagingForm {
  name: string; code: string; kind: PackagingKind; size: number; unit: Unit;
  grossWeightKg?: number; sortOrder?: number; active?: boolean;
}

export async function adminListPackagings(token: string): Promise<AdminPackaging[]> {
  const res = await authedFetch("/api/admin/catalogue/packagings", token);
  return res.json();
}

export async function adminCreatePackaging(token: string, form: PackagingForm): Promise<AdminPackaging> {
  const res = await authedFetch("/api/admin/catalogue/packagings", token, { method: "POST", body: JSON.stringify(form) });
  return res.json();
}

export async function adminUpdatePackaging(token: string, id: string, form: PackagingForm): Promise<AdminPackaging> {
  const res = await authedFetch(`/api/admin/catalogue/packagings/${id}`, token, { method: "PUT", body: JSON.stringify(form) });
  return res.json();
}

export async function adminRetirePackaging(token: string, id: string): Promise<void> {
  await authedFetch(`/api/admin/catalogue/packagings/${id}`, token, { method: "DELETE" });
}

// ---- catalogue: products ----

export interface ProductForm {
  oilCategoryId: string; name: string; slug: string;
  shortDescription?: string; description?: string;
  extractionMethod?: string; shelfLifeMonths?: number; madeAt?: string;
  featured?: boolean; sortOrder?: number; active?: boolean;
}

export async function adminListProducts(token: string): Promise<AdminProduct[]> {
  const res = await authedFetch("/api/admin/catalogue/products", token);
  return res.json();
}

export async function adminCreateProduct(token: string, form: ProductForm): Promise<AdminProduct> {
  const res = await authedFetch("/api/admin/catalogue/products", token, { method: "POST", body: JSON.stringify(form) });
  return res.json();
}

export async function adminUpdateProduct(token: string, id: string, form: ProductForm): Promise<AdminProduct> {
  const res = await authedFetch(`/api/admin/catalogue/products/${id}`, token, { method: "PUT", body: JSON.stringify(form) });
  return res.json();
}

/** Soft delete — retires the product (and it stops offering its variants for
 *  sale); past orders referencing its variants are untouched. */
export async function adminRetireProduct(token: string, id: string): Promise<void> {
  await authedFetch(`/api/admin/catalogue/products/${id}`, token, { method: "DELETE" });
}

// ---- catalogue: variants (the actual purchasable rows) ----

export interface VariantForm {
  productId: string; packagingId: string; sku?: string;
  price: number; mrp?: number; stock?: number; lowStockThreshold?: number;
  batchCode?: string; active?: boolean;
}

export async function adminListVariants(token: string): Promise<AdminVariant[]> {
  const res = await authedFetch("/api/admin/catalogue/variants", token);
  return res.json();
}

export async function adminCreateVariant(token: string, form: VariantForm): Promise<AdminVariant> {
  const res = await authedFetch("/api/admin/catalogue/variants", token, { method: "POST", body: JSON.stringify(form) });
  return res.json();
}

export async function adminUpdateVariant(token: string, id: string, form: VariantForm): Promise<AdminVariant> {
  const res = await authedFetch(`/api/admin/catalogue/variants/${id}`, token, { method: "PUT", body: JSON.stringify(form) });
  return res.json();
}

export async function adminSetVariantStock(token: string, id: string, stock: number): Promise<AdminVariant> {
  const res = await authedFetch(`/api/admin/catalogue/variants/${id}/stock?stock=${stock}`, token, { method: "PATCH" });
  return res.json();
}

/** Soft delete — stops the variant (one pack size of one product) from
 *  being sold. This is "remove a product" for most day-to-day purposes:
 *  the mill rarely deletes the whole recipe, just retires one pack size. */
export async function adminRetireVariant(token: string, id: string): Promise<void> {
  await authedFetch(`/api/admin/catalogue/variants/${id}`, token, { method: "DELETE" });
}

// ---- customers ----

export interface CustomerForm { name?: string; email?: string }

export async function adminListCustomers(token: string): Promise<AdminCustomer[]> {
  const res = await authedFetch("/api/admin/customers", token);
  return res.json();
}

export async function adminUpdateCustomer(token: string, id: string, form: CustomerForm): Promise<AdminCustomer> {
  const res = await authedFetch(`/api/admin/customers/${id}`, token, { method: "PUT", body: JSON.stringify(form) });
  return res.json();
}

/** Soft delete — a deactivated customer can no longer sign in, but their
 *  order history stays intact. Reactivate to undo. */
export async function adminDeactivateCustomer(token: string, id: string): Promise<void> {
  await authedFetch(`/api/admin/customers/${id}/deactivate`, token, { method: "PATCH" });
}

export async function adminReactivateCustomer(token: string, id: string): Promise<void> {
  await authedFetch(`/api/admin/customers/${id}/reactivate`, token, { method: "PATCH" });
}

// ---- reviews (delete-only — no edit, no admin-authored reviews) ----

export async function adminListReviews(token: string): Promise<AdminReview[]> {
  const res = await authedFetch("/api/admin/reviews", token);
  return res.json();
}

export async function adminApproveReview(token: string, id: string): Promise<void> {
  await authedFetch(`/api/admin/reviews/${id}/approve`, token, { method: "POST" });
}

export async function adminRejectReview(token: string, id: string): Promise<void> {
  await authedFetch(`/api/admin/reviews/${id}/reject`, token, { method: "POST" });
}

export async function adminDeleteReview(token: string, id: string): Promise<void> {
  await authedFetch(`/api/admin/reviews/${id}`, token, { method: "DELETE" });
}

// ---- payments (read-only — completed payments only) ----

export async function adminListPayments(token: string): Promise<AdminPayment[]> {
  const res = await authedFetch("/api/admin/payments", token);
  return res.json();
}
