"use client";
import { useState } from "react";
import { clsx } from "clsx";
import { useCart } from "@/store/cart";
import { toast } from "./Toast";
import type { VariantCard } from "@/lib/types";

export function AddToCartButton({ variant, qty = 1, size = "md", block = false, style = "primary" }: {
  variant: VariantCard; qty?: number; size?: "sm" | "md"; block?: boolean; style?: "primary" | "gold";
}) {
  const add = useCart((s) => s.add);
  const [busy, setBusy] = useState(false);

  if (!variant.inStock) {
    return (
      <button type="button" onClick={() => toast("We will text you when this pack is back")}
              className={clsx("rounded-control border border-line-2 font-semibold",
                size === "sm" ? "px-4 py-2 text-sm" : "px-6 py-3", block && "w-full")}>
        Tell me when it is back
      </button>
    );
  }
  return (
    <button type="button" disabled={busy}
      onClick={() => { setBusy(true); add(variant, qty); toast(`${variant.productName}, ${variant.packaging.name} added`, "ok"); setTimeout(() => setBusy(false), 400); }}
      className={clsx("rounded-control font-semibold transition active:translate-y-px disabled:opacity-60",
        style === "gold" ? "bg-gold text-[#2A1E07] hover:bg-[#E9AD2B]" : "bg-ink text-[#FFF6E6] hover:bg-[#3A2C20]",
        size === "sm" ? "px-4 py-2 text-sm" : "px-6 py-3", block && "w-full")}>
      {busy ? "Added" : "Add to cart"}
    </button>
  );
}
