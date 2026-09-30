import type { OrderDto, OrderPage } from "./order";
import type { AdminUserView } from "./adminAuth";

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
