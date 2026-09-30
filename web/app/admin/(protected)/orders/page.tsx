"use client";
import { useEffect, useState } from "react";
import { useAdminAuth } from "@/store/adminAuth";
import { adminListOrders, adminRefundOrder, adminUpdateOrderStatus } from "@/lib/adminApi";
import type { OrderDto } from "@/lib/order";
import { money } from "@/lib/format";

const STATUSES = ["PENDING_PAYMENT", "PAID", "PACKED", "DISPATCHED", "DELIVERED", "CANCELLED", "PAYMENT_FAILED", "REFUNDED"] as const;
const REFUNDABLE = new Set(["PAID", "PACKED", "DISPATCHED", "DELIVERED"]);

const STATUS_TONE: Record<string, string> = {
  PAID: "bg-[#E7F1E8] text-[#2F6B37]",
  DELIVERED: "bg-[#E7F1E8] text-[#2F6B37]",
  PACKED: "bg-gold-tint text-[#8A6208]",
  DISPATCHED: "bg-gold-tint text-[#8A6208]",
  PENDING_PAYMENT: "bg-gold-tint text-[#8A6208]",
  CANCELLED: "bg-[#FCEDEA] text-[#7E241A]",
  PAYMENT_FAILED: "bg-[#FCEDEA] text-[#7E241A]",
  REFUNDED: "bg-[#EDEAE3] text-[#5B5347]",
};

export default function AdminOrdersPage() {
  const token = useAdminAuth((s) => s.token);
  const [orders, setOrders] = useState<OrderDto[] | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    setOrders(null);
    setError(null);
    adminListOrders(token, statusFilter || undefined, page)
      .then((p) => { setOrders(p.content); setTotalPages(Math.max(1, p.totalPages)); })
      .catch((e) => setError(e instanceof Error ? e.message : "Could not load orders."));
  }, [token, statusFilter, page]);

  async function changeStatus(orderId: string, status: string) {
    if (!token) return;
    setBusyId(orderId);
    try {
      const updated = await adminUpdateOrderStatus(token, orderId, status);
      setOrders((cur) => cur?.map((o) => (o.id === orderId ? updated : o)) ?? cur);
    } catch (e) {
      setToastMsg(e instanceof Error ? e.message : "Could not update status.");
    } finally {
      setBusyId(null);
    }
  }

  async function refund(orderId: string) {
    if (!token) return;
    if (!confirm("Refund this order in full through Razorpay? This cannot be undone.")) return;
    setBusyId(orderId);
    try {
      const updated = await adminRefundOrder(token, orderId);
      setOrders((cur) => cur?.map((o) => (o.id === orderId ? updated : o)) ?? cur);
      setToastMsg(`Refunded ${money(updated.refund?.refundedAmount ?? updated.total)} for ${updated.orderNumber}.`);
    } catch (e) {
      setToastMsg(e instanceof Error ? e.message : "Refund failed.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div className="mb-5.5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[1.7rem]">Orders</h1>
          <p className="text-sm text-ink-3">Live data from the backend.</p>
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
                className="rounded-control border border-line-2 bg-white px-4 py-2 text-sm">
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
        </select>
      </div>

      {toastMsg && (
        <div className="mb-4 flex items-center justify-between rounded-card border border-line bg-card px-4 py-3 text-sm">
          {toastMsg}
          <button onClick={() => setToastMsg(null)} className="text-ink-3">✕</button>
        </div>
      )}

      {error ? (
        <div className="rounded-2xl border border-[#E7C3BD] bg-[#FCEDEA] px-5 py-5 text-[#7E241A]">{error}</div>
      ) : orders === null ? (
        <div className="space-y-2">{[0, 1, 2, 3].map((i) => <div key={i} className="h-14 animate-pulse rounded-2xl bg-paper-2" />)}</div>
      ) : orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line-2 bg-white px-5 py-14 text-center text-ink-3">No orders match this filter.</div>
      ) : (
        <div className="overflow-auto rounded-2xl border border-[#E6E3DC] bg-white">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                {["Order", "Customer", "Payment", "Total", "Status", "Placed", "Actions"].map((h) => (
                  <th key={h} className="border-b border-[#E6E3DC] px-3.5 py-3 text-left text-xs font-semibold text-[#7A756C]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td className="border-b border-[#F0EEE9] px-3.5 py-3"><b>{o.orderNumber}</b></td>
                  <td className="border-b border-[#F0EEE9] px-3.5 py-3">{o.contactName ?? "—"}</td>
                  <td className="border-b border-[#F0EEE9] px-3.5 py-3">{o.paymentMethod ?? "—"}</td>
                  <td className="border-b border-[#F0EEE9] px-3.5 py-3">{money(o.total)}</td>
                  <td className="border-b border-[#F0EEE9] px-3.5 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_TONE[o.status] ?? "bg-paper-2 text-ink-2"}`}>
                      {o.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="border-b border-[#F0EEE9] px-3.5 py-3 text-xs text-ink-3">
                    {o.placedAt ? new Date(o.placedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—"}
                  </td>
                  <td className="border-b border-[#F0EEE9] px-3.5 py-3">
                    <div className="flex items-center gap-2">
                      <select defaultValue="" disabled={busyId === o.id}
                              onChange={(e) => { if (e.target.value) { changeStatus(o.id, e.target.value); e.target.value = ""; } }}
                              className="rounded-control border border-line-2 bg-white px-2 py-1.5 text-xs">
                        <option value="">Set status…</option>
                        {/* REFUNDED is excluded here on purpose — it should only ever be set
                            through the Refund button, which actually calls Razorpay. Setting
                            it from this dropdown would mark an order refunded with no real
                            money having moved. */}
                        {STATUSES.filter((s) => s !== o.status && s !== "REFUNDED").map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
                      </select>
                      {REFUNDABLE.has(o.status) && (
                        <button onClick={() => refund(o.id)} disabled={busyId === o.id}
                                className="rounded-control border border-line-2 px-2.5 py-1.5 text-xs font-semibold disabled:opacity-50">
                          Refund
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3">
          <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}
                  className="rounded-control border border-line-2 px-4 py-2 text-sm disabled:opacity-40">Previous</button>
          <span className="text-sm text-ink-3">Page {page + 1} of {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                  className="rounded-control border border-line-2 px-4 py-2 text-sm disabled:opacity-40">Next</button>
        </div>
      )}
    </div>
  );
}
