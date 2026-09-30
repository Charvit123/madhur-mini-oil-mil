"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/store/adminAuth";

/**
 * Wraps the protected admin route group. Waits for the persisted session to
 * finish hydrating from localStorage before deciding anything — checking
 * before that point would see the pre-hydration default (no session) even
 * for an already-logged-in admin and redirect them incorrectly.
 *
 * This is a UI convenience, not the real security boundary: every admin
 * endpoint independently enforces its own auth on the backend regardless of
 * what this component does. If someone bypasses this and calls the API
 * directly without a valid token, Spring Security still rejects it.
 */
export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { token, hydrated } = useAdminAuth();

  useEffect(() => {
    if (hydrated && !token) router.replace("/admin/login");
  }, [hydrated, token, router]);

  if (!hydrated || !token) return null;
  return <>{children}</>;
}
