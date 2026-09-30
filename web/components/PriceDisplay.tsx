import { money } from "@/lib/format";
import { clsx } from "clsx";

export function PriceDisplay({ price, mrp, discountPercent, size = "md", showTaxNote = false }: {
  price: number; mrp?: number; discountPercent?: number; size?: "sm" | "md" | "lg"; showTaxNote?: boolean;
}) {
  const hasOffer = !!mrp && mrp > price;
  return (
    <div className="flex flex-wrap items-baseline gap-2">
      <b className={clsx("font-display font-semibold", size === "lg" ? "text-3xl" : size === "sm" ? "text-base" : "text-lg")}>
        {money(price)}
      </b>
      {hasOffer && <s className="text-sm text-ink-3">{money(mrp!)}</s>}
      {hasOffer && !!discountPercent && <span className="text-xs font-bold text-ok">{discountPercent}% off</span>}
      {showTaxNote && <span className="w-full text-xs text-ink-3">Inclusive of all taxes</span>}
    </div>
  );
}
