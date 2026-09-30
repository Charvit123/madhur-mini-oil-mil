"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { VariantCard } from "@/lib/types";

export interface CartLine { variant: VariantCard; qty: number }

interface CartState {
  lines: CartLine[];
  isOpen: boolean;
  add: (variant: VariantCard, qty?: number) => void;
  setQty: (variantId: string, qty: number) => void;
  remove: (variantId: string) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
}

export const FREE_SHIPPING_OVER = 1499;
const FLAT_SHIPPING = 79;

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      isOpen: false,
      add: (variant, qty = 1) =>
        set((s) => {
          const cap = (n: number) => Math.min(n, variant.stock);
          const existing = s.lines.find((l) => l.variant.id === variant.id);
          return {
            isOpen: true,
            lines: existing
              ? s.lines.map((l) => (l.variant.id === variant.id ? { ...l, qty: cap(l.qty + qty) } : l))
              : [...s.lines, { variant, qty: cap(qty) }],
          };
        }),
      setQty: (variantId, qty) =>
        set((s) => ({
          lines: qty <= 0
            ? s.lines.filter((l) => l.variant.id !== variantId)
            : s.lines.map((l) => (l.variant.id === variantId ? { ...l, qty: Math.min(qty, l.variant.stock) } : l)),
        })),
      remove: (variantId) => set((s) => ({ lines: s.lines.filter((l) => l.variant.id !== variantId) })),
      clear: () => set({ lines: [] }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
    }),
    { name: "madhur.cart", partialize: (s) => ({ lines: s.lines }) }
  )
);

export function cartTotals(lines: CartLine[]) {
  const subtotal = lines.reduce((sum, l) => sum + l.variant.price * l.qty, 0);
  const saved = lines.reduce((sum, l) => sum + ((l.variant.mrp ?? l.variant.price) - l.variant.price) * l.qty, 0);
  const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_OVER ? 0 : FLAT_SHIPPING;
  const count = lines.reduce((n, l) => n + l.qty, 0);
  return { subtotal, saved, shipping, total: subtotal + shipping, count, freeShippingGap: Math.max(0, FREE_SHIPPING_OVER - subtotal) };
}
