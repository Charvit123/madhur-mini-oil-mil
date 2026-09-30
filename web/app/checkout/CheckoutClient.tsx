"use client";
import { useState } from "react";
import Link from "next/link";
import { PackArt } from "@/components/PackArt";
import { EmptyState } from "@/components/states/EmptyState";
import { useCart, cartTotals } from "@/store/cart";
import { money } from "@/lib/format";
import { createOrder, verifyPayment, type CreateOrderRequest, type OrderDto } from "@/lib/order";
import { loadRazorpayScript } from "@/lib/razorpay";
import { useAuth } from "@/store/auth";

const STEPS = ["Contact", "Address", "Delivery", "Payment", "Done"];
const PHONE_RE = /^[6-9]\d{9}$/;
const PINCODE_RE = /^\d{6}$/;

type PaymentMethod = "UPI" | "CARD" | "NETBANKING" | "COD";
const PAYMENT_OPTIONS: [PaymentMethod, string, string][] = [
  ["UPI", "UPI", "GPay, PhonePe, Paytm and any UPI app"],
  ["CARD", "Credit or debit card", "Visa, Mastercard, RuPay"],
  ["NETBANKING", "Net banking", "All major Indian banks"],
  ["COD", "Cash on delivery", "Available up to ₹5,000, ₹40 handling fee"],
];

export function CheckoutClient() {
  const { lines, clear } = useCart();
  const { subtotal, shipping, total } = cartTotals(lines);
  const authToken = useAuth((s) => s.token);
  const savedCustomer = useAuth((s) => s.customer);

  const [step, setStep] = useState(1);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [paying, setPaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [placedOrder, setPlacedOrder] = useState<OrderDto | null>(null);

  // Every field the backend's CreateOrderRequest needs, actually captured —
  // the previous version of this page used uncontrolled inputs with no
  // onChange at all, so nothing typed here ever reached component state,
  // which is the root reason no order request was ever possible.
  const [contact, setContact] = useState({
    name: savedCustomer?.name ?? "",
    phone: savedCustomer?.phone ?? "",
    email: savedCustomer?.email ?? "",
  });
  const [address, setAddress] = useState({ fullName: "", line1: "", line2: "", city: "", state: "Gujarat", pincode: "" });
  const [deliveryMethod, setDeliveryMethod] = useState<"STANDARD" | "MILL_PICKUP">("STANDARD");
  const [pay, setPay] = useState<PaymentMethod>("UPI");

  if (!lines.length && step < 5) {
    return (
      <div className="mt-8">
        <EmptyState title="There is nothing to check out" body="Add at least one pack before you get to payment."
                    action={{ label: "Go to shop", href: "/shop" }} />
      </div>
    );
  }

  const step1Valid = contact.name.trim().length > 0 && PHONE_RE.test(contact.phone);
  const step2Valid = address.fullName.trim().length > 0 && address.line1.trim().length > 0
    && address.city.trim().length > 0 && address.state.trim().length > 0 && PINCODE_RE.test(address.pincode);

  async function handlePay() {
    setErrorMsg(null);
    setFailed(false);
    setPaying(true);

    const payload: CreateOrderRequest = {
      items: lines.map((l) => ({ variantId: l.variant.id, quantity: l.qty })),
      contactName: contact.name.trim(),
      contactPhone: contact.phone.trim(),
      contactEmail: contact.email.trim() || undefined,
      shipLine1: address.line1.trim(),
      shipLine2: address.line2.trim() || undefined,
      shipCity: address.city.trim(),
      shipState: address.state.trim(),
      shipPincode: address.pincode.trim(),
      deliveryMethod,
      paymentMethod: pay,
    };

    try {
      const order = await createOrder(payload, authToken ?? undefined);

      // Cash on delivery skips Razorpay entirely — the backend already
      // marked it confirmed (see OrderService#createOrder).
      if (pay === "COD") {
        clear();
        setPlacedOrder(order);
        setStep(5);
        setPaying(false);
        return;
      }

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded || !order.razorpay || !window.Razorpay) {
        throw new Error("Could not load the payment window. Check your connection and try again.");
      }

      const rzp = new window.Razorpay({
        key: order.razorpay.keyId,
        amount: order.razorpay.amountPaise,
        currency: order.razorpay.currency,
        order_id: order.razorpay.razorpayOrderId,
        name: "Madhur Mini Oil Mill",
        description: `Order ${order.orderNumber}`,
        prefill: { name: contact.name, contact: contact.phone, email: contact.email || undefined },
        theme: { color: "#D79B1E" },
        handler: (response) => {
          verifyPayment(order.id, {
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          })
            .then((verified) => {
              clear();
              setPlacedOrder(verified);
              setStep(5);
            })
            .catch((e) => {
              setErrorMsg(e instanceof Error ? e.message : "Payment could not be verified");
              setFailed(true);
            })
            .finally(() => setPaying(false));
        },
        modal: { ondismiss: () => setPaying(false) },
      });

      rzp.on("payment.failed", (resp) => {
        setErrorMsg(resp.error?.description || "The bank declined the request.");
        setFailed(true);
        setPaying(false);
      });

      rzp.open();
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Something went wrong placing the order.");
      setFailed(true);
      setPaying(false);
    }
  }

  return (
    <div className="pb-20">
      <div className="mt-5 flex flex-wrap gap-1.5">
        {STEPS.map((s, i) => (
          <span key={s} className={`rounded-control px-3.5 py-2 text-sm
            ${step === i + 1 ? "bg-ink text-[#F6EEE2]" : step > i + 1 ? "bg-olive-tint text-olive-dark" : "bg-paper-2 text-ink-3"}`}>
            {i + 1}. {s}
          </span>
        ))}
      </div>

      <div className="mt-5 grid items-start gap-6 pb-0 lg:grid-cols-[1fr_360px] lg:gap-11">
        <div className="rounded-panel border border-line bg-card p-5.5">
          {step === 1 && (
            <div>
              <h3 className="text-[1.15rem]">Where do we send updates?</h3>
              <div className="mt-4 grid gap-3.5 sm:grid-cols-2">
                <Field label="Mobile number" placeholder="10 digit number" inputMode="numeric" maxLength={10}
                       value={contact.phone} onChange={(v) => setContact((c) => ({ ...c, phone: v.replace(/\D/g, "") }))} />
                <Field label="Email" type="email" placeholder="you@example.com"
                       value={contact.email} onChange={(v) => setContact((c) => ({ ...c, email: v }))} />
              </div>
              <Field label="Full name" placeholder="Who should we ask for at delivery?"
                     value={contact.name} onChange={(v) => setContact((c) => ({ ...c, name: v }))} />
              <label className="mt-1 flex items-center gap-2.5 text-sm text-ink-2">
                <input type="checkbox" defaultChecked className="h-4 w-4 accent-olive" /> Send dispatch updates on WhatsApp
              </label>
              <button onClick={() => setStep(2)} disabled={!step1Valid}
                      className="mt-4.5 rounded-control bg-ink px-6 py-3 font-semibold text-[#FFF6E6] disabled:opacity-50">
                Continue to address
              </button>
            </div>
          )}

          {step === 2 && (
            <div>
              <h3 className="text-[1.15rem]">Delivery address</h3>
              <div className="mt-4 grid gap-3.5 sm:grid-cols-2">
                <Field label="Full name" value={address.fullName} onChange={(v) => setAddress((a) => ({ ...a, fullName: v }))} />
                <Field label="Pincode" inputMode="numeric" maxLength={6}
                       value={address.pincode} onChange={(v) => setAddress((a) => ({ ...a, pincode: v.replace(/\D/g, "") }))} />
              </div>
              <Field label="Flat, building, street" value={address.line1} onChange={(v) => setAddress((a) => ({ ...a, line1: v }))} />
              <Field label="Area, landmark (optional)" value={address.line2} onChange={(v) => setAddress((a) => ({ ...a, line2: v }))} />
              <div className="grid gap-3.5 sm:grid-cols-2">
                <Field label="City" value={address.city} onChange={(v) => setAddress((a) => ({ ...a, city: v }))} />
                <Field label="State" value={address.state} onChange={(v) => setAddress((a) => ({ ...a, state: v }))} />
              </div>
              <div className="mt-1 flex gap-2.5">
                <button onClick={() => setStep(1)} className="rounded-control border border-line-2 px-6 py-3 font-semibold">Back</button>
                <button onClick={() => setStep(3)} disabled={!step2Valid}
                        className="rounded-control bg-ink px-6 py-3 font-semibold text-[#FFF6E6] disabled:opacity-50">
                  Continue to delivery
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h3 className="text-[1.15rem]">Delivery option</h3>
              <div className="mt-4 space-y-2.5">
                <label className={`flex items-center gap-3 rounded-xl border p-4 ${deliveryMethod === "STANDARD" ? "border-ink bg-[#FFFDF8] shadow-[0_0_0_1px_rgb(36,27,20)]" : "border-line-2"}`}>
                  <input type="radio" name="dl" checked={deliveryMethod === "STANDARD"} onChange={() => setDeliveryMethod("STANDARD")} />
                  <span><b>Standard, 2 to 5 days</b><br /><span className="text-sm text-ink-3">{shipping ? money(shipping) : "Free on this order"} · tins packed in corrugated outers</span></span>
                </label>
                <label className={`flex items-center gap-3 rounded-xl border p-4 ${deliveryMethod === "MILL_PICKUP" ? "border-ink bg-[#FFFDF8] shadow-[0_0_0_1px_rgb(36,27,20)]" : "border-line-2"}`}>
                  <input type="radio" name="dl" checked={deliveryMethod === "MILL_PICKUP"} onChange={() => setDeliveryMethod("MILL_PICKUP")} />
                  <span><b>Mill pickup, Rajkot</b><br /><span className="text-sm text-ink-3">No charge · ready in 4 working hours</span></span>
                </label>
              </div>
              <div className="mt-4.5 flex gap-2.5">
                <button onClick={() => setStep(2)} className="rounded-control border border-line-2 px-6 py-3 font-semibold">Back</button>
                <button onClick={() => setStep(4)} className="rounded-control bg-ink px-6 py-3 font-semibold text-[#FFF6E6]">Continue to payment</button>
              </div>
            </div>
          )}

          {step === 4 && !failed && (
            <div>
              <h3 className="text-[1.15rem]">Payment</h3>
              <div className="mt-4 space-y-2.5">
                {PAYMENT_OPTIONS.map(([id, t, d]) => (
                  <label key={id} className={`flex items-center gap-3 rounded-xl border p-4 ${pay === id ? "border-ink bg-[#FFFDF8] shadow-[0_0_0_1px_rgb(36,27,20)]" : "border-line-2"}`}>
                    <input type="radio" name="pay" checked={pay === id} onChange={() => setPay(id)} />
                    <span><b>{t}</b><br /><span className="text-sm text-ink-3">{d}</span></span>
                  </label>
                ))}
              </div>
              <p className="mt-3.5 rounded-xl bg-gold-tint px-4 py-3 text-sm text-[#6B4C06]">
                {pay === "COD" ? "Pay in cash when the tin arrives." : "Payments run through Razorpay. Card details never touch our servers."}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2.5">
                <button onClick={() => setStep(3)} className="rounded-control border border-line-2 px-6 py-3 font-semibold">Back</button>
                <button onClick={handlePay} disabled={paying} className="rounded-control bg-gold px-6 py-3 font-semibold text-[#2A1E07] disabled:opacity-60">
                  {paying ? "Contacting Razorpay…" : pay === "COD" ? `Place order · ${money(total)}` : `Pay ${money(total)}`}
                </button>
              </div>
            </div>
          )}

          {step === 4 && failed && (
            <div>
              <div className="rounded-card border border-[#E7C3BD] bg-[#FCEDEA] px-5 py-5 text-[#7E241A]">
                <b>Payment did not go through</b>
                <p className="mt-1.5 text-sm">
                  {errorMsg ?? "The bank declined the request and nothing has been charged. Your cart is untouched, so you can retry with a different method."}
                </p>
              </div>
              <div className="mt-4 flex gap-2.5">
                <button onClick={() => { setFailed(false); setErrorMsg(null); }} className="rounded-control bg-ink px-6 py-3 font-semibold text-[#FFF6E6]">Try another method</button>
                <Link href="/cart" className="rounded-control border border-line-2 px-6 py-3 font-semibold">Back to cart</Link>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="py-6 text-center">
              <div className="mx-auto mb-4.5 grid h-16 w-16 place-items-center rounded-full bg-olive-tint text-olive-dark">
                <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round"><path d="m4.5 12.5 4.5 4.5L19.5 6.5" /></svg>
              </div>
              <h2 className="text-h2">Order placed</h2>
              <p className="mx-auto mt-3 max-w-[44ch] text-ink-3">
                Order <b>{placedOrder?.orderNumber ?? "—"}</b> is confirmed. We press and pack on Tuesday and Friday, so this leaves the mill on the next slot. Tracking comes by SMS.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-2.5">
                <Link href="/shop" className="rounded-control bg-ink px-6 py-3 font-semibold text-[#FFF6E6]">Continue shopping</Link>
                <Link href="/account" className="rounded-control border border-line-2 px-6 py-3 font-semibold">View order</Link>
              </div>
            </div>
          )}
        </div>

        {step < 5 && (
          <div className="rounded-panel border border-line bg-card p-5.5">
            <button onClick={() => setSummaryOpen((o) => !o)} className="flex w-full items-center justify-between">
              <h3 className="text-[1.05rem]">Order summary</h3><b>{money(total)}</b>
            </button>
            <div className={`mt-3.5 ${summaryOpen ? "" : "hidden lg:block"}`}>
              {lines.map(({ variant, qty }) => (
                <div key={variant.id} className="flex gap-3 py-2">
                  <div className="grid h-[52px] w-[52px] flex-none place-items-center rounded-xl bg-paper-2 p-1.5">
                    <PackArt kind={variant.packaging.kind} color={variant.oilColor} label={variant.productName} className="h-full w-auto" />
                  </div>
                  <div className="flex-1 text-sm"><b>{variant.productName}</b><br /><span className="text-ink-3">{variant.packaging.name} × {qty}</span></div>
                  <span className="text-sm">{money(variant.price * qty)}</span>
                </div>
              ))}
              <div className="mt-2 flex justify-between text-sm text-ink-2"><span>Subtotal</span><span>{money(subtotal)}</span></div>
              <div className="flex justify-between text-sm text-ink-2"><span>Delivery</span><span>{shipping ? money(shipping) : "Free"}</span></div>
              <div className="mt-2 flex justify-between border-t border-line pt-3 text-lg font-bold"><span>To pay</span><span>{money(total)}</span></div>
              <p className="mt-2 text-xs text-ink-3">Final total is confirmed by the server at payment — this is an estimate.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, type = "text", placeholder, value, onChange, inputMode, maxLength }: {
  label: string; type?: string; placeholder?: string; value: string; onChange: (value: string) => void;
  inputMode?: "text" | "numeric" | "email"; maxLength?: number;
}) {
  return (
    <div className="mb-3.5 flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-ink-2">{label}</label>
      <input type={type} placeholder={placeholder} value={value} inputMode={inputMode} maxLength={maxLength}
             onChange={(e) => onChange(e.target.value)}
             className="rounded-xl border border-line-2 bg-white px-4 py-3" />
    </div>
  );
}
