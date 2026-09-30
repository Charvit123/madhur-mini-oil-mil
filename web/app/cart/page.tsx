"use client";
import Link from "next/link";
import { Breadcrumb } from "@/components/Breadcrumb";
import { PackArt } from "@/components/PackArt";
import { QuantitySelector } from "@/components/QuantitySelector";
import { EmptyState } from "@/components/states/EmptyState";
import { useCart, cartTotals } from "@/store/cart";
import { money } from "@/lib/format";

export default function CartPage() {
  const { lines, setQty, remove } = useCart();
  const { subtotal, saved, shipping, total, freeShippingGap } = cartTotals(lines);

  return (
    <main className="shell py-2 pb-20">
      <Breadcrumb items={[["Home", "/"], ["Cart"]]} />
      <h1 className="text-[clamp(1.8rem,4vw,2.6rem)]">Cart</h1>

      {!lines.length ? (
        <div className="mt-8">
          <EmptyState title="Your cart is empty" body="Pick an oil, choose a pack size, and it will land here."
                      action={{ label: "Start with groundnut", href: "/shop" }} />
        </div>
      ) : (
        <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1fr_360px] lg:gap-11">
          <div className="rounded-panel border border-line bg-card p-5.5">
            {lines.map(({ variant, qty }) => (
              <div key={variant.id} className="grid grid-cols-[76px_1fr] gap-3.5 border-b border-line py-4 last:border-0">
                <div className="grid aspect-square place-items-center rounded-xl bg-paper-2 p-2">
                  <PackArt kind={variant.packaging.kind} color={variant.oilColor} label={variant.productName} className="h-full w-auto" />
                </div>
                <div>
                  <div className="flex justify-between gap-3">
                    <div>
                      <Link href={`/product/${variant.productSlug}?v=${variant.id}`} className="font-semibold">{variant.productName}</Link>
                      <div className="text-sm text-ink-3">{variant.packaging.name} · {variant.sku}</div>
                    </div>
                    <b>{money(variant.price * qty)}</b>
                  </div>
                  <div className="mt-3 flex items-center gap-4">
                    <QuantitySelector value={qty} max={variant.stock} onChange={(n) => setQty(variant.id, n)} />
                    <button onClick={() => remove(variant.id)} className="text-sm text-ink-3 underline">Remove</button>
                  </div>
                </div>
              </div>
            ))}
            <Link href="/shop" className="mt-4.5 inline-block rounded-control border border-line-2 px-4 py-2 text-sm font-semibold">Keep shopping</Link>
          </div>

          <div className="sticky top-24 rounded-panel border border-line bg-card p-5.5">
            <h3 className="mb-3 text-[1.2rem]">Summary</h3>
            <Row label="Subtotal" value={money(subtotal)} />
            {saved > 0 && <Row label="Saving" value={`−${money(saved)}`} tone="ok" />}
            <Row label="Delivery" value={shipping ? money(shipping) : "Free"} />
            <div className="mt-2 flex justify-between border-t border-line pt-3 text-lg font-bold"><span>To pay</span><span>{money(total)}</span></div>
            {freeShippingGap > 0 && (
              <p className="mt-3.5 rounded-xl bg-gold-tint px-3.5 py-2.5 text-sm text-[#6B4C06]">Add {money(freeShippingGap)} more for free delivery inside Gujarat.</p>
            )}
            <Link href="/checkout" className="mt-4 block rounded-control bg-ink py-3 text-center font-semibold text-[#FFF6E6]">Checkout</Link>
          </div>
        </div>
      )}
    </main>
  );
}

function Row({ label, value, tone }: { label: string; value: string; tone?: "ok" }) {
  return <div className={`flex justify-between py-1 text-sm ${tone === "ok" ? "text-ok" : "text-ink-2"}`}><span>{label}</span><span>{value}</span></div>;
}
