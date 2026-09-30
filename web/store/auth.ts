"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Customer } from "@/lib/auth";

interface AuthState {
  token: string | null;
  customer: Customer | null;
  hydrated: boolean;
  setSession: (token: string, customer: Customer) => void;
  logout: () => void;
  setHydrated: () => void;
}

// `hydrated` starts false and flips true once zustand's persist middleware
// finishes reading localStorage on the client. Without this, a component
// that checks "is there a token?" on its very first render sees the
// pre-hydration default (null) even for an actually-logged-in customer,
// which is exactly the false-logged-out flash this flag exists to avoid.
export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      customer: null,
      hydrated: false,
      setSession: (token, customer) => set({ token, customer }),
      logout: () => set({ token: null, customer: null }),
      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: "madhur.auth",
      partialize: (s) => ({ token: s.token, customer: s.customer }),
      onRehydrateStorage: () => (state) => state?.setHydrated(),
    }
  )
);
