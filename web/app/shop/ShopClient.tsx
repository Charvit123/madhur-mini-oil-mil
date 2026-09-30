"use client";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FilterSidebar } from "@/components/FilterSidebar";
import { ProductGrid } from "@/components/ProductGrid";
import { ProductGridSkeleton } from "@/components/states/LoadingSkeleton";
import { ErrorState } from "@/components/states/ErrorState";
import type { Page, ShopFacets, ShopQuery, VariantCard } from "@/lib/types";

const SORTS: { value: NonNullable<ShopQuery["sort"]>; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price, low to high" },
  { value: "price-desc", label: "Price, high to low" },
  { value: "rating", label: "Best rated" },
  { value: "newest", label: "Newest" },
];

export function ShopClient({ facets, initialPage, initialQuery }: {
  facets: ShopFacets; initialPage: Page<VariantCard>; initialQuery: ShopQuery;
}) {
  const router = useRouter();
  const [query, setQuery] = useState<ShopQuery>(initialQuery);
  const [result, setResult] = useState(initialPage);
  const [error, setError] = useState(false);
  const [loading, startTransition] = useTransition();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [first, setFirst] = useState(true);

  useEffect(() => {
    if (first) { setFirst(false); return; }
    const params = new URLSearchParams();
    query.oil?.forEach((o) => params.append("oil", o));
    query.pack?.forEach((p) => params.append("pack", p));
    if (query.q) params.set("q", query.q);
    if (query.sort && query.sort !== "featured") params.set("sort", query.sort);
    router.replace(`/shop?${params}`, { scroll: false });

    startTransition(async () => {
      try {
        // NEXT_PUBLIC_API_URL is a public env var, so it's inlined into the
        // browser bundle too — without reading it here, this fetch always
        // hit this app's own local mock route (app/api/catalogue/variants),
        // even when the rest of the app (via lib/api.ts, server-side) had
        // been pointed at a real backend. That meant filtering/sorting on
        // the shop page silently showed different data than the page's
        // initial load, which looked like "search is broken."
        const base = process.env.NEXT_PUBLIC_API_URL ?? "";
        const res = await fetch(`${base}/api/catalogue/variants?${params}`, { cache: "no-store" });
        if (!res.ok) throw new Error();
        setResult(await res.json());
        setError(false);
      } catch { setError(true); }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const clear = () => setQuery({ sort: query.sort });

  return (
    <div className="shell grid items-start gap-8 py-8 lg:grid-cols-[268px_1fr]">
      <aside className="sticky top-24 hidden lg:block">
        <FilterSidebar {...facets} query={query} onChange={setQuery} />
      </aside>

      <div>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2.5">
          <span className="text-ink-3">{result.total} product{result.total === 1 ? "" : "s"}</span>
          <div className="ml-auto flex gap-2.5">
            <button onClick={() => setDrawerOpen(true)} className="rounded-control border border-line-2 bg-card px-4 py-2 text-sm lg:hidden">
              <span className="inline-flex items-center gap-2">
                <svg width={16} height={16} viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth={1.9} strokeLinecap="round"><path d="M4 7h16M7 12h10M10 17h4" /></svg>
                Filter
              </span>
            </button>
            <select value={query.sort ?? "featured"} onChange={(e) => setQuery({ ...query, sort: e.target.value as ShopQuery["sort"], page: 0 })}
                    className="rounded-control border border-line-2 bg-card px-4 py-2 text-sm" aria-label="Sort products">
              {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        </div>

        {(query.oil?.length || query.pack?.length) ? (
          <div className="mb-4 flex flex-wrap gap-2">
            {query.oil?.map((slug) => {
              const oil = facets.oils.find((o) => o.slug === slug);
              return oil && (
                <button key={slug} onClick={() => setQuery({ ...query, oil: query.oil!.filter((o) => o !== slug) })}
                        className="rounded-control bg-olive-tint px-3 py-1.5 text-sm font-semibold text-olive-dark">{oil.name} ✕</button>
              );
            })}
            {query.pack?.map((code) => {
              const pack = facets.packagings.find((p) => p.code === code);
              return pack && (
                <button key={code} onClick={() => setQuery({ ...query, pack: query.pack!.filter((p) => p !== code) })}
                        className="rounded-control bg-olive-tint px-3 py-1.5 text-sm font-semibold text-olive-dark">{pack.name} ✕</button>
              );
            })}
            <button onClick={clear} className="rounded-control bg-paper-2 px-3 py-1.5 text-sm font-semibold text-ink-2">Clear all</button>
          </div>
        ) : null}

        {error ? <ErrorState onRetry={() => setQuery({ ...query })} />
          : loading ? <ProductGridSkeleton count={8} />
          : <ProductGrid variants={result.items} onClearFilters={clear} />}
      </div>

      {drawerOpen && (
        <div className="fixed inset-0 z-[80] lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
          <div className="absolute inset-0 bg-ink/50" onClick={() => setDrawerOpen(false)} />
          <div className="absolute inset-y-0 right-0 w-[min(420px,88vw)] overflow-y-auto bg-paper p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-h3">Filter</h3>
              <button onClick={() => setDrawerOpen(false)} aria-label="Close filters">✕</button>
            </div>
            <FilterSidebar {...facets} query={query} onChange={setQuery} />
            <button onClick={() => setDrawerOpen(false)} className="mt-5 w-full rounded-control bg-ink py-3 font-semibold text-[#FFF6E6]">
              Show {result.total} results
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
