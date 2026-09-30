/** Admin login — same pattern as lib/auth.ts and lib/order.ts. */

export interface AdminUserView {
  id: string;
  username: string;
  fullName?: string;
  role: "ADMIN" | "SUPER_ADMIN";
  active: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export interface AdminLoginResponse {
  token: string;
  admin: AdminUserView;
}

export class AdminAuthApiError extends Error {
  constructor(message: string, public status?: number) { super(message); }
}

function backendBase(): string {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) {
    throw new AdminAuthApiError(
      "Admin sign-in needs the real backend. Set NEXT_PUBLIC_API_URL in web/.env.local " +
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

export async function adminLogin(username: string, password: string): Promise<AdminLoginResponse> {
  const res = await fetch(`${backendBase()}/api/admin/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw new AdminAuthApiError(await parseErrorMessage(res), res.status);
  return res.json();
}
