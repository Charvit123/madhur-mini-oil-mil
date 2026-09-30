/**
 * Customer OTP login — client-safe (not "server-only"), calls the real
 * backend directly the same way lib/order.ts does, since there's no local
 * mock for auth either.
 */

export interface Customer {
  id: string;
  phone: string;
  name?: string;
  email?: string;
  phoneVerified: boolean;
}

export interface AuthResponse {
  token: string;
  customer: Customer;
}

export class AuthApiError extends Error {
  constructor(message: string, public status?: number) { super(message); }
}

function backendBase(): string {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) {
    throw new AuthApiError(
      "Signing in needs the real backend. Set NEXT_PUBLIC_API_URL in web/.env.local " +
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

export async function requestOtp(phone: string): Promise<void> {
  const res = await fetch(`${backendBase()}/api/auth/otp/request`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone }),
  });
  if (!res.ok) throw new AuthApiError(await parseErrorMessage(res), res.status);
}

export async function verifyOtp(phone: string, code: string): Promise<AuthResponse> {
  const res = await fetch(`${backendBase()}/api/auth/otp/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, code }),
  });
  if (!res.ok) throw new AuthApiError(await parseErrorMessage(res), res.status);
  return res.json();
}
