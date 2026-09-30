"use client";
import { clsx } from "clsx";
import { money } from "@/lib/format";
import type { VariantCard } from "@/lib/types";

export function VariantSelector({ variants, selectedId, onSelect }: {
  variants: VariantCard[]; selectedId: string; onSelect: (v: VariantCard) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-3 text-sm font-bold">Pack size</legend>
      <div className="flex flex-wrap gap-2.5" role="radiogroup" aria-label="Pack size">
        {variants.map((v) => {
          const selected = v.id === selectedId;
          return (
            <button key={v.id} type="button" role="radio" aria-checked={selected} disabled={!v.inStock}
              onClick={() => onSelect(v)}
              className={clsx("min-w-[126px] rounded-xl border px-3.5 py-2.5 text-left transition",
                selected ? "border-ink bg-[#FFFDF8] shadow-[0_0_0_1px_rgb(36,27,20)]" : "border-line-2 bg-card hover:border-ink-3",
                !v.inStock && "cursor-not-allowed opacity-45")}>
              <b className="block text-sm">{v.packaging.name}</b>
              <span className="text-sm text-ink-3">{v.inStock ? money(v.price) : "Out of stock"}</span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
