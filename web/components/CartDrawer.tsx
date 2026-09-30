"use client";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { PackArt } from "./PackArt";
import { QuantitySelector } from "./QuantitySelector";
import { useCart, cartTotals } from "@/store/cart";
import { money } from "@/lib/format";
import { slideIn, scrim } from "@/lib/motion";

export function CartDrawer() {
  const { lines, isOpen, close, setQty, remove } = useCart();
  const { subtotal, saved, shipping, total, freeShippingGap } = cartTotals(lines);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [isOpen, close]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* z-[70]/[80], matching the mobile menu drawer — must clear the
              sticky nav's z-[60], or the nav renders on top of the drawer's
              own header and clips it (exactly what was happening here). */}
          <motion.div variants={scrim} initial="hidden" animate="show" exit="exit" onClick={close} className="fixed inset-0 z-[70] bg-ink/50" />
          <motion.aside variants={slideIn("right")} initial="hidden" animate="show" exit="exit"
            role="dialog" aria-modal="true" aria-label="Your cart"
            className="fixed inset-y-0 right-0 z-[80] flex w-[min(420px,88vw)] flex-col bg-paper shadow-lift">
            <header className="flex items-center justify-between border-b border-line px-5 py-4">
              <h3 className="text-h3">Your cart</h3>
              <button onClick={close} aria-label="Close cart" className="h-10 w-10 rounded-full hover:bg-card">✕</button>
            </header>

            <div className="flex-1 overflow-y-auto px-5">
              {!lines.length ? (
                <div className="py-14 text-center">
                  <h4 className="font-display text-h3">Nothing in the cart yet</h4>
                  <p className="mx-auto mt-2 max-w-[32ch] text-sm text-ink-3">Pick a pack size from any oil and it will show up here.</p>
                  <Link href="/shop" onClick={close} className="mt-5 inline-block rounded-control bg-gold px-6 py-3 font-semibold text-[#2A1E07]">Browse oils</Link>
                </div>
              ) : lines.map(({ variant, qty }) => (
                <div key={variant.id} className="grid grid-cols-[76px_1fr] gap-3.5 border-b border-line py-4">
                  <div className="grid aspect-square place-items-center rounded-xl bg-paper-2 p-2">
                    <PackArt kind={variant.packaging.kind} color={variant.oilColor} label={variant.productName} className="h-full w-auto" />
                  </div>
                  <div>
                    <div className="text-[0.95rem] font-semibold">{variant.productName}</div>
                    <div className="text-sm text-ink-3">{variant.packaging.name} · {variant.sku}</div>
                    <div className="mt-2.5 flex items-center justify-between gap-2">
                      <div className="origin-left scale-[0.86]"><QuantitySelector value={qty} max={variant.stock} onChange={(n) => setQty(variant.id, n)} /></div>
                      <b>{money(variant.price * qty)}</b>
                    </div>
                    <button onClick={() => remove(variant.id)} className="mt-1 text-xs text-ink-3 underline">Remove</button>
                  </div>
                </div>
              ))}
            </div>

            {!!lines.length && (
              <footer className="border-t border-line bg-card px-5 py-4">
                <Row label="Subtotal" value={money(subtotal)} />
                {saved > 0 && <Row label="You save" value={`−${money(saved)}`} tone="ok" />}
                <Row label="Delivery" value={shipping ? money(shipping) : "Free"} />
                {freeShippingGap > 0 && (
                  <p className="mt-2 rounded-xl bg-gold-tint px-3 py-2 text-xs text-[#6B4C06]">Add {money(freeShippingGap)} more for free delivery inside Gujarat.</p>
                )}
                <div className="mt-2 flex justify-between border-t border-line pt-3 text-lg font-bold"><span>Total</span><span>{money(total)}</span></div>
                <Link href="/checkout" onClick={close} className="mt-3.5 block rounded-control bg-ink py-3 text-center font-semibold text-[#FFF6E6]">Go to checkout</Link>
              </footer>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
function Row({ label, value, tone }: { label: string; value: string; tone?: "ok" }) {
  return <div className={`flex justify-between py-1 text-sm ${tone === "ok" ? "text-ok" : "text-ink-2"}`}><span>{label}</span><span>{value}</span></div>;
}
