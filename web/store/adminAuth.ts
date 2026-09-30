"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AdminUserView } from "@/lib/adminAuth";

interface AdminAuthState {
  token: string | null;
  admin: AdminUserView | null;
  hydrated: boolean;
  setSession: (token: string, admin: AdminUserView) => void;
  logout: () => void;
  setHydrated: () => void;
}

// Same hydration-flag pattern as store/auth.ts, and a deliberately separate
// store/localStorage key — an admin session and a customer session are
// different principals and should never be able to bleed into each other.
export const useAdminAuth = create<AdminAuthState>()(
  persist(
    (set) => ({
      token: null,
      admin: null,
      hydrated: false,
      setSession: (token, admin) => set({ token, admin }),
      logout: () => set({ token: null, admin: null }),
      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: "madhur.admin-auth",
      partialize: (s) => ({ token: s.token, admin: s.admin }),
      onRehydrateStorage: () => (state) => state?.setHydrated(),
    }
  )
);
