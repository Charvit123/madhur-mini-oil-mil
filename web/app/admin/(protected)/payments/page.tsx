"use client";
import { useEffect, useState } from "react";
import { useAdminAuth } from "@/store/adminAuth";
import { adminListPayments } from "@/lib/adminApi";
import type { AdminPayment } from "@/lib/types";
import { Tag } from "../AdminShell";
import { money } from "@/lib/format";
import { exportCsv } from "@/lib/exportCsv";

/** Read-only by design — a payment is a record of what Razorpay actually
 *  did, not something to hand-edit. Only completed payments (captured or
 *  refunded) show here; a failed or abandoned attempt isn't a "payment
 *  which is done". Refunding an order happens on the Orders screen, and
 *  updates this list because it goes through Razorpay itself. */
export default function AdminPaymentsPage() {
  const { token } = useAdminAuth();
  const [payments, setPayments] = useState<AdminPayment[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    adminListPayments(token).then(setPayments).catch((e) => setError(e instanceof Error ? e.message : "Could not load payments."));
  }, [token]);

  function doExport() {
    if (!payments) return;
    exportCsv("payments.csv", payments.map((p) => ({
      Order: p.orderNumber, Customer: p.customerName, "Razorpay payment id": p.razorpayPaymentId ?? "",
      Amount: p.amount, Method: p.method ?? "", Status: p.status,
      Refunded: p.refundedAmount ?? "", Date: new Date(p.createdAt).toLocaleString("en-IN"),
    })));
  }

  const total = payments?.reduce((sum, p) => sum + (p.status === "CAPTURED" ? p.amount : 0), 0) ?? 0;

  return (
    <div>
      <div className="mb-5.5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[1.7rem]">Payments</h1>
          <p className="text-sm text-ink-3">Completed payments only — read-only. Refunds happen from the Orders screen.</p>
        </div>
        <button onClick={doExport} disabled={!payments?.length} className="rounded-control border border-line-2 bg-white px-4 py-2 text-sm font-semibold disabled:opacity-50">Export CSV</button>
      </div>

      {error ? (
        <div className="rounded-2xl border border-[#E7C3BD] bg-[#FCEDEA] px-5 py-5 text-[#7E241A]">{error}</div>
      ) : payments === null ? (
        <div className="space-y-2">{[0, 1, 2].map((i) => <div key={i} className="h-14 animate-pulse rounded-2xl bg-paper-2" />)}</div>
      ) : payments.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line-2 bg-white px-5 py-8 text-center text-ink-3">No completed payments yet.</p>
      ) : (
        <>
          <p className="mb-3 text-sm text-ink-3">{payments.length} payments · {money(total)} captured</p>
          <div className="overflow-auto rounded-2xl border border-[#E6E3DC] bg-white">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>{["Order", "Customer", "Amount", "Method", "Status", "Date"].map((h) => (
                  <th key={h} className="border-b border-[#E6E3DC] px-3.5 py-3 text-left text-xs font-semibold text-[#7A756C]">{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td className="border-b border-[#F0EEE9] px-3.5 py-3"><b>{p.orderNumber}</b></td>
                    <td className="border-b border-[#F0EEE9] px-3.5 py-3">{p.customerName}</td>
                    <td className="border-b border-[#F0EEE9] px-3.5 py-3">{money(p.amount)}</td>
                    <td className="border-b border-[#F0EEE9] px-3.5 py-3 uppercase text-ink-3">{p.method ?? "—"}</td>
                    <td className="border-b border-[#F0EEE9] px-3.5 py-3"><Tag ok={p.status === "CAPTURED"}>{p.status === "CAPTURED" ? "Captured" : "Refunded"}</Tag></td>
                    <td className="border-b border-[#F0EEE9] px-3.5 py-3 text-ink-3">{new Date(p.createdAt).toLocaleDateString("en-IN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
