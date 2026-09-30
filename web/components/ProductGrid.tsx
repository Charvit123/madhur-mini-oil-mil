"use client";
import { motion } from "framer-motion";
import { ProductCard } from "./ProductCard";
import { EmptyState } from "./states/EmptyState";
import { stagger } from "@/lib/motion";
import type { VariantCard } from "@/lib/types";

export function ProductGrid({ variants, onClearFilters }: { variants: VariantCard[]; onClearFilters?: () => void }) {
  if (!variants.length) {
    return (
      <EmptyState title="No packs match those filters"
        body="Try widening the price limit or clearing a pack size. Everything we press is listed on this page."
        action={onClearFilters && { label: "Clear filters", onClick: onClearFilters }} />
    );
  }
  return (
    // Mount-triggered (not scroll-triggered): whileInView depends on an
    // IntersectionObserver firing after hydration, which can silently never
    // happen (wrong container, a timing race, etc.) — when it doesn't, cards
    // stay at the "hidden" variant's opacity:0 forever while still reserving
    // their grid space, which is indistinguishable from "no products" without
    // opening devtools. animate="show" fires immediately once mounted, no
    // observer involved, so the grid can never go invisible this way again.
    <motion.div variants={stagger(0.05)} initial="hidden" animate="show"
      className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 xl:grid-cols-4">
      {variants.map((v) => <ProductCard key={v.id} variant={v} />)}
    </motion.div>
  );
}
