"use client";
import { useMemo } from "react";
import { money } from "@/lib/format";
import type { OilSummary, Packaging, ShopQuery } from "@/lib/types";

/** Same controls the prototype's #filterCol / #filterBody share — one
 *  component so desktop sidebar and mobile drawer never drift apart. */
export function FilterSidebar({ oils, packagings, minPrice, maxPrice, query, onChange }: {
  oils: OilSummary[]; packagings: Packaging[]; minPrice: number; maxPrice: number;
  query: ShopQuery; onChange: (next: ShopQuery) => void;
}) {
  const selectedOils = useMemo(() => new Set(query.oil ?? []), [query.oil]);
  const selectedPacks = useMemo(() => new Set(query.pack ?? []), [query.pack]);

  const toggle = (key: "oil" | "pack", value: string) => {
    const current = new Set(key === "oil" ? selectedOils : selectedPacks);
    current.has(value) ? current.delete(value) : current.add(value);
    onChange({ ...query, [key]: [...current], page: 0 });
  };

  return (
    <div className="flex flex-col gap-5">
      <Group title="Oil">
        {oils.map((o) => (
          <Option key={o.id} label={o.name} count={o.variantCount} checked={selectedOils.has(o.slug)} onChange={() => toggle("oil", o.slug)} />
        ))}
      </Group>
      <Group title="Pack size">
        {packagings.map((p) => (
          <Option key={p.id} label={p.name} checked={selectedPacks.has(p.code)} onChange={() => toggle("pack", p.code)} />
        ))}
      </Group>
      <Group title="Maximum price">
        <input type="range" min={minPrice} max={maxPrice} step={50} value={query.maxPrice ?? maxPrice}
               onChange={(e) => onChange({ ...query, maxPrice: Number(e.target.value), page: 0 })}
               className="w-full accent-gold" aria-label="Maximum price" />
        <div className="flex justify-between text-xs text-ink-3"><span>{money(minPrice)}</span><span>{money(query.maxPrice ?? maxPrice)}</span></div>
      </Group>
      <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink-2">
        <input type="checkbox" className="h-4 w-4 accent-olive" checked={!!query.inStock}
               onChange={(e) => onChange({ ...query, inStock: e.target.checked, page: 0 })} />
        In stock only
      </label>
    </div>
  );
}
function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-card border border-line bg-card p-4">
      <h4 className="mb-3 text-sm font-bold">{title}</h4>
      <div className="flex flex-col">{children}</div>
    </section>
  );
}
function Option({ label, count, checked, onChange }: { label: string; count?: number; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 py-1.5 text-[0.93rem] text-ink-2">
      <input type="checkbox" checked={checked} onChange={onChange} className="h-4 w-4 accent-olive" />
      {label}
      {count !== undefined && <span className="ml-auto text-xs text-ink-3">{count}</span>}
    </label>
  );
}
