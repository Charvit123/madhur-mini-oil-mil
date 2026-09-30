"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/store/auth";
import { requestOtp, verifyOtp, AuthApiError, type Customer } from "@/lib/auth";
import { listMyOrders, type OrderDto } from "@/lib/order";
import { money } from "@/lib/format";
import { toast } from "@/components/Toast";

const PHONE_RE = /^[6-9]\d{9}$/;

export default function AccountPage() {
  const { token, customer, hydrated, setSession, logout } = useAuth();

  // Not hydrated yet — briefly unknown whether there's a saved session.
  // Rendering nothing here (rather than the logged-out form) is what stops
  // an already-logged-in visitor from seeing a flash of the login form.
  if (!hydrated) {
    return <main className="shell max-w-[560px] py-9 pb-24" />;
  }

  return (
    <main className="shell max-w-[560px] py-9 pb-24">
      <h1 className="text-[2rem]">Your account</h1>
      {token && customer ? (
        <LoggedInView token={token} customer={customer} onLogout={logout} />
      ) : (
        <LoginForm onSuccess={setSession} />
      )}
    </main>
  );
}

function LoginForm({ onSuccess }: { onSuccess: (token: string, customer: Customer) => void }) {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendOtp() {
    setError(null);
    if (!PHONE_RE.test(phone)) { setError("Enter a valid 10 digit mobile number."); return; }
    setBusy(true);
    try {
      await requestOtp(phone);
      setStep("otp");
      toast("Code sent to your mobile", "ok");
    } catch (e) {
      setError(e instanceof AuthApiError ? e.message : "Could not send a code. Try again.");
    } finally {
      setBusy(false);
    }
  }

  async function verify() {
    setError(null);
    if (!/^\d{6}$/.test(code)) { setError("Enter the 6 digit code."); return; }
    setBusy(true);
    try {
      const res = await verifyOtp(phone, code);
      onSuccess(res.token, res.customer);
      toast("Signed in", "ok");
    } catch (e) {
      setError(e instanceof AuthApiError ? e.message : "That code didn't work. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-5 rounded-panel border border-line bg-card p-5.5">
      {step === "phone" ? (
        <>
          <p className="text-ink-3">Sign in with your mobile number to see past orders, saved addresses and repeat an order in one tap.</p>
          <div className="my-4 flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-ink-2">Mobile number</label>
            <input inputMode="numeric" maxLength={10} placeholder="10 digit number" value={phone}
                   onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                   onKeyDown={(e) => e.key === "Enter" && sendOtp()}
                   className="rounded-xl border border-line-2 bg-white px-4 py-3" />
          </div>
          {error && <p className="mb-3 text-sm text-err">{error}</p>}
          <button onClick={sendOtp} disabled={busy} className="w-full rounded-control bg-ink py-3 font-semibold text-[#FFF6E6] disabled:opacity-60">
            {busy ? "Sending…" : "Send OTP"}
          </button>
        </>
      ) : (
        <>
          <p className="text-ink-3">We sent a 6 digit code to <b>+91 {phone}</b>.</p>
          <div className="my-4 flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-ink-2">Enter code</label>
            <input inputMode="numeric" maxLength={6} placeholder="6 digit code" value={code}
                   onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                   onKeyDown={(e) => e.key === "Enter" && verify()}
                   className="rounded-xl border border-line-2 bg-white px-4 py-3 tracking-[0.3em]" />
          </div>
          {error && <p className="mb-3 text-sm text-err">{error}</p>}
          <div className="flex gap-2.5">
            <button onClick={() => { setStep("phone"); setCode(""); setError(null); }}
                    className="rounded-control border border-line-2 px-5 py-3 font-semibold">Back</button>
            <button onClick={verify} disabled={busy} className="flex-1 rounded-control bg-gold py-3 font-semibold text-[#2A1E07] disabled:opacity-60">
              {busy ? "Checking…" : "Verify & sign in"}
            </button>
          </div>
          <button onClick={sendOtp} disabled={busy} className="mt-3 text-sm text-ink-3 underline">Resend code</button>
        </>
      )}
    </div>
  );
}

function LoggedInView({ token, customer, onLogout }: {
  token: string; customer: Customer; onLogout: () => void;
}) {
  const [orders, setOrders] = useState<OrderDto[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    listMyOrders(token)
      .then((page) => setOrders(page.content))
      .catch((e) => setLoadError(e instanceof Error ? e.message : "Could not load your orders."));
  }, [token]);

  return (
    <div className="mt-5 space-y-5">
      <div className="flex items-center justify-between rounded-panel border border-line bg-card p-5.5">
        <div>
          <b className="block">{customer.name || "Your account"}</b>
          <span className="text-sm text-ink-3">+91 {customer.phone}{customer.email ? ` · ${customer.email}` : ""}</span>
        </div>
        <button onClick={onLogout} className="rounded-control border border-line-2 px-4 py-2 text-sm font-semibold">Log out</button>
      </div>

      <div>
        <h2 className="mb-3 text-[1.15rem]">Your orders</h2>
        {loadError ? (
          <p className="rounded-card border border-[#E7C3BD] bg-[#FCEDEA] px-4 py-3 text-sm text-[#7E241A]">{loadError}</p>
        ) : orders === null ? (
          <div className="space-y-2.5">
            {[0, 1].map((i) => <div key={i} className="h-20 animate-pulse rounded-panel bg-paper-2" />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-panel border border-dashed border-line-2 bg-card px-5 py-10 text-center">
            <p className="text-ink-3">No orders yet.</p>
            <Link href="/shop" className="mt-3 inline-block rounded-control bg-gold px-5 py-2.5 text-sm font-semibold text-[#2A1E07]">Start shopping</Link>
          </div>
        ) : (
          <div className="space-y-2.5">
            {orders.map((o) => <OrderRow key={o.id} order={o} />)}
          </div>
        )}
      </div>
    </div>
  );
}

function OrderRow({ order }: { order: OrderDto }) {
  const tone = order.status === "PAID" || order.status === "DELIVERED" ? "text-ok"
    : order.status === "PENDING_PAYMENT" ? "text-warn"
    : order.status === "CANCELLED" || order.status === "PAYMENT_FAILED" || order.status === "REFUNDED" ? "text-err"
    : "text-ink-2";
  return (
    <div className="flex items-center justify-between rounded-panel border border-line bg-card p-4">
      <div>
        <b className="text-sm">{order.orderNumber}</b>
        <div className={`text-xs font-semibold ${tone}`}>{order.status.replace("_", " ")}</div>
        {order.placedAt && <div className="text-xs text-ink-3">{new Date(order.placedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</div>}
      </div>
      <b>{money(order.total)}</b>
    </div>
  );
}
