"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { PackArt } from "./PackArt";
import { PriceDisplay } from "./PriceDisplay";
import { RatingStars } from "./RatingStars";
import { AddToCartButton } from "./AddToCartButton";
import { toast } from "./Toast";
import { fadeUp } from "@/lib/motion";
import type { VariantCard } from "@/lib/types";
import { useState } from "react";

/** Matches the prototype's .pcard exactly: badge, wishlist heart, quick-view
 *  on hover as a sibling of the image link (never nested inside it), then
 *  oil name / product name / pack / rating / price / add-to-cart. */
export function ProductCard({ variant }: { variant: VariantCard }) {
  const href = `/product/${variant.productSlug}?v=${variant.id}`;
  const [wished, setWished] = useState(false);

  return (
    <motion.article variants={fadeUp}
      className="group relative flex flex-col overflow-hidden rounded-card border border-line bg-card
                 transition-shadow duration-200 hover:border-line-2 hover:shadow-lift">
      {!variant.inStock ? (
        <span className="absolute left-2.5 top-2.5 z-10 rounded-md bg-ink-3 px-2 py-1 text-[11px] font-bold text-white">Out of stock</span>
      ) : variant.discountPercent >= 10 ? (
        <span className="absolute left-2.5 top-2.5 z-10 rounded-md bg-kiln px-2 py-1 text-[11px] font-bold text-white">{variant.discountPercent}% off</span>
      ) : null}

      <button type="button" aria-label={`Save ${variant.productName}`}
        onClick={() => { setWished((w) => !w); toast(wished ? "Removed from your list" : "Saved to your list"); }}
        className="absolute right-2 top-2 z-10 grid h-9 w-9 place-items-center rounded-full border border-line bg-white/90">
        <svg width={17} height={17} viewBox="0 0 24 24" fill={wished ? "#B3541E" : "none"} stroke={wished ? "#B3541E" : "#7A6A5A"} strokeWidth={1.8}>
          <path d="M12 20s-7.5-4.6-7.5-9.5a4.3 4.3 0 0 1 7.5-2.8 4.3 4.3 0 0 1 7.5 2.8C19.5 15.4 12 20 12 20z" />
        </svg>
      </button>

      <div className="relative">
        <Link href={href} aria-label={`${variant.productName}, ${variant.packaging.name}`}
              className="grid aspect-square place-items-center p-3.5"
              style={{ background: `linear-gradient(170deg,#FFFDF8,${variant.oilColor}33)` }}>
          <PackArt kind={variant.packaging.kind} color={variant.oilColor} label={variant.productName}
                   className="h-[88%] w-auto transition-transform duration-300 group-hover:scale-105" />
        </Link>
        <div className="pointer-events-none absolute inset-x-2.5 bottom-2.5 translate-y-1.5 opacity-0
                        transition duration-200 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100
                        motion-reduce:transition-none">
          <Link href={href} className="block rounded-control border border-line-2 bg-white py-2 text-center text-sm font-semibold">
            Quick view
          </Link>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3.5">
        <Link href={`/shop/${variant.oilSlug}`} className="text-xs font-semibold text-olive-dark">{variant.oilName}</Link>
        <Link href={href} className="text-[0.95rem] font-semibold leading-snug">{variant.productName}</Link>
        <span className="text-sm text-ink-3">{variant.packaging.name} · {variant.sku}</span>
        <RatingStars rating={variant.ratingAverage} count={variant.ratingCount} />
        {variant.inStock
          ? <PriceDisplay price={variant.price} mrp={variant.mrp} discountPercent={variant.discountPercent} />
          : <span className="text-[0.95rem] font-semibold text-ink-3">Back soon</span>}
        <div className="mt-auto pt-2.5">
          <AddToCartButton variant={variant} size="sm" block />
        </div>
      </div>
    </motion.article>
  );
}
