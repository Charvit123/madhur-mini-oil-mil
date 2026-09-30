"use client";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { PackArt } from "@/components/PackArt";
import { VariantSelector } from "@/components/VariantSelector";
import { QuantitySelector } from "@/components/QuantitySelector";
import { PriceDisplay } from "@/components/PriceDisplay";
import { RatingStars } from "@/components/RatingStars";
import { AddToCartButton } from "@/components/AddToCartButton";
import { useCart } from "@/store/cart";
import { stockLabel, formatDate } from "@/lib/format";
import { swapArt } from "@/lib/motion";
import { PROCESS } from "@/lib/content";
import type { ProductDetail, Review, VariantCard } from "@/lib/types";

const TABS = ["Description", "Specifications", "Benefits", "How it is made", "Reviews"] as const;

export function ProductDetailClient({ product, initialVariantId, reviews }: {
  product: ProductDetail; initialVariantId?: string; reviews: Review[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [variant, setVariant] = useState<VariantCard>(product.variants.find((v) => v.id === initialVariantId) ?? product.variants[0]);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<(typeof TABS)[number]>("Description");
  const [zoomed, setZoomed] = useState(false);
  const add = useCart((s) => s.add);

  const select = (next: VariantCard) => {
    setVariant(next);
    setQty(1);
    router.replace(`${pathname}?v=${next.id}`, { scroll: false });
  };

  const stock = stockLabel(variant);

  return (
    <div className="shell grid items-start gap-8 py-4 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
      {/* Gallery */}
      <div className="lg:sticky lg:top-24">
        <button onClick={() => setZoomed((z) => !z)} aria-label={zoomed ? "Zoom out" : "Zoom in"}
          className="relative grid aspect-square w-full place-items-center overflow-hidden rounded-panel border border-line bg-card p-6"
          style={{ background: `linear-gradient(170deg,#FFFDF8,${variant.oilColor}22)` }}>
          <AnimatePresence mode="wait">
            <motion.div key={variant.id} variants={swapArt} initial="hidden" animate="show" exit="exit" className="grid h-full w-full place-items-center">
              <PackArt kind={variant.packaging.kind} color={variant.oilColor} label={`${product.name}, ${variant.packaging.name}`}
                       className={`h-[86%] w-auto transition-transform duration-300 ${zoomed ? "scale-150" : ""}`} />
            </motion.div>
          </AnimatePresence>
          <span className="absolute bottom-3.5 right-3.5 rounded-control border border-line bg-paper px-3 py-1.5 text-xs text-ink-3">Tap the pack to zoom</span>
        </button>

        <div className="mt-3 flex gap-2.5 overflow-x-auto pb-1">
          {product.variants.map((v) => (
            <button key={v.id} onClick={() => v.inStock && select(v)} aria-label={v.packaging.name} aria-current={v.id === variant.id}
              className={`grid h-[76px] w-[76px] shrink-0 place-items-center rounded-xl border bg-card p-2
                ${v.id === variant.id ? "border-ink shadow-[0_0_0_1px_rgb(36,27,20)]" : "border-line"}`}>
              <PackArt kind={v.packaging.kind} color={v.oilColor} label={v.packaging.name} className="h-full w-auto" />
            </button>
          ))}
        </div>
      </div>

      {/* Buy box */}
      <div>
        <Link href={`/shop/${product.oil.slug}`} className="text-sm font-semibold text-olive-dark">{product.oil.name}</Link>
        <h1 className="mt-2 text-h2">{product.name}</h1>

        <div className="my-3.5 flex flex-wrap items-center gap-3.5">
          <RatingStars rating={product.ratingAverage} count={product.ratingCount} />
          <span className="text-sm text-ink-3">SKU {variant.sku}</span>
        </div>
        <p className="max-w-prose text-ink-3">{product.shortDescription} {product.oil.tagline}.</p>

        <div className="my-5 rounded-card border border-line bg-card p-5">
          {variant.inStock
            ? <PriceDisplay price={variant.price} mrp={variant.mrp} discountPercent={variant.discountPercent} size="lg" showTaxNote />
            : <b className="font-display text-2xl text-ink-3">Currently unavailable</b>}
          <p className={`mt-2.5 text-sm font-semibold ${stock.tone === "ok" ? "text-ok" : stock.tone === "low" ? "text-warn" : "text-err"}`}>● {stock.text}</p>
        </div>

        <VariantSelector variants={product.variants} selectedId={variant.id} onSelect={select} />

        <div className="mt-5 flex flex-wrap gap-3">
          <QuantitySelector value={qty} onChange={setQty} max={Math.max(1, variant.stock)} />
          <AddToCartButton variant={variant} qty={qty} />
          <button disabled={!variant.inStock} onClick={() => { add(variant, qty); router.push("/checkout"); }}
            className="rounded-control bg-gold px-6 py-3 font-semibold text-[#2A1E07] disabled:opacity-45">Buy now</button>
        </div>

        <div className="mt-5.5 grid grid-cols-3 gap-2.5">
          <TrustItem label="Ships in 24 hours" icon="M3 7h11v10H3zM14 10h4l3 3v4h-7z" />
          <TrustItem label="Sealed and batch coded" icon="M12 3l7 3v6c0 4.2-2.9 7.4-7 9-4.1-1.6-7-4.8-7-9V6z" />
          <TrustItem label="Damage replaced free" icon="M4 12h16M12 4v16" />
        </div>

        <div className="mt-10">
          <div className="flex gap-1.5 overflow-x-auto border-b border-line" role="tablist">
            {TABS.map((t) => (
              <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)}
                className={`-mb-px whitespace-nowrap border-b-2 px-4 py-3.5 font-semibold ${tab === t ? "border-gold text-ink" : "border-transparent text-ink-3"}`}>
                {t === "Reviews" ? `Reviews (${reviews.length})` : t}
              </button>
            ))}
          </div>

          <div className="max-w-prose py-6">
            {tab === "Description" && <p className="text-ink-2">{product.description ?? product.shortDescription}</p>}

            {tab === "Specifications" && (
              <table className="w-full text-[0.94rem]">
                <tbody>
                  {[...product.specs,
                    { key: "Pack", value: variant.packaging.name },
                    { key: "Net quantity", value: `${variant.packaging.size} ${variant.packaging.unit.toLowerCase()}` },
                    { key: "SKU", value: variant.sku },
                  ].map((s) => (
                    <tr key={s.key} className="border-b border-line">
                      <td className="w-[44%] py-3 text-ink-3">{s.key}</td>
                      <td className="py-3">{s.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {tab === "Benefits" && <p className="text-ink-2">{product.oil.tagline}</p>}

            {tab === "How it is made" && (
              <div className="grid gap-3">
                {PROCESS.map(([t, d], i) => (
                  <div key={t} className="grid grid-cols-[34px_1fr] gap-3.5">
                    <b className="font-display text-gold-dark">{i + 1}</b>
                    <div><b>{t}</b><p className="text-[0.93rem] text-ink-3">{d}</p></div>
                  </div>
                ))}
              </div>
            )}

            {tab === "Reviews" && (
              reviews.length ? (
                <div className="space-y-3.5">
                  {reviews.map((r) => (
                    <article key={r.id} className="rounded-panel border border-line bg-card p-5">
                      <div className="flex items-center justify-between">
                        <RatingStars rating={r.rating} />
                        <span className="text-xs text-ink-3">{formatDate(r.createdAt)}</span>
                      </div>
                      <p className="mt-2.5">{r.body}</p>
                      <p className="mt-2 text-sm text-ink-3">{r.authorName}{r.city ? `, ${r.city}` : ""}{r.verifiedPurchase ? " · Verified purchase" : ""}</p>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="text-ink-3">This pack is new on the line. If you have bought it, tell the next buyer what it is like.</p>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TrustItem({ label, icon }: { label: string; icon: string }) {
  return (
    <div className="rounded-card bg-paper-2 px-3 py-3.5 text-center text-[0.8rem] font-semibold">
      <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} className="mx-auto mb-1.5 text-olive-dark"><path d={icon} /></svg>
      {label}
    </div>
  );
}
