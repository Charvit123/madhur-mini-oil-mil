"use client";
import { useEffect, useState } from "react";
import { useAdminAuth } from "@/store/adminAuth";
import { adminDashboardStats } from "@/lib/adminApi";
import type { DashboardStats } from "@/lib/types";
import { Kpi, Table, Tag } from "../AdminShell";
import { money } from "@/lib/format";

export default function DashboardPage() {
  const { token } = useAdminAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    adminDashboardStats(token).then(setStats).catch((e) => setError(e instanceof Error ? e.message : "Could not load dashboard stats."));
  }, [token]);

  if (error) return <div className="rounded-2xl border border-[#E7C3BD] bg-[#FCEDEA] px-5 py-5 text-[#7E241A]">{error}</div>;
  if (!stats) return <div className="space-y-3.5"><div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">{[0, 1, 2, 3].map((i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-paper-2" />)}</div></div>;

  const changeLabel = `${stats.revenueChangePercent >= 0 ? "+" : ""}${stats.revenueChangePercent.toFixed(0)}% vs last month`;
  const maxWeek = Math.max(1, ...stats.salesLast12Weeks.map((w) => w.total));

  return (
    <div>
      <div className="mb-5.5">
        <h1 className="text-[1.7rem]">Dashboard</h1>
        <p className="text-sm text-ink-3">Live figures from the order database — nothing on this page is sample data.</p>
      </div>

      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Revenue, this month" value={money(stats.revenueThisMonth)} note={changeLabel} tone={stats.revenueChangePercent >= 0 ? "ok" : "err"} />
        <Kpi label="Orders, this month" value={String(stats.ordersThisMonth)} note="Paid orders only" />
        <Kpi label="Awaiting dispatch" value={String(stats.pendingOrders)} note="Paid, not yet packed" tone={stats.pendingOrders > 0 ? "warn" : "ok"} />
        <Kpi label="Live pack sizes" value={String(stats.activeVariants)} note={`${stats.lowStockCount} low on stock`} tone={stats.lowStockCount ? "err" : "ok"} />
      </div>

      <div className="mt-4.5 overflow-hidden rounded-2xl border border-[#E6E3DC] bg-white pb-3.5">
        <div className="flex justify-between px-3.5 pt-3.5"><b>Sales, last 12 weeks</b><span className="text-sm text-ink-3">₹ per week</span></div>
        {maxWeek <= 1 ? (
          <p className="px-4 py-8 text-center text-sm text-ink-3">No orders yet in this window.</p>
        ) : (
          <div className="flex h-[170px] items-end gap-2.5 p-4">
            {stats.salesLast12Weeks.map((w, i) => (
              <div key={i} className="group relative flex-1" title={`${w.weekLabel}: ${money(w.total)}`}>
                <div style={{ height: `${Math.max(2, (w.total / maxWeek) * 100)}%` }}
                  className="w-full rounded-t bg-gradient-to-b from-[#E8B84D] to-[#C68C12]" />
              </div>
            ))}
          </div>
        )}
        <div className="flex justify-between px-4 text-[0.7rem] text-ink-3">
          <span>{stats.salesLast12Weeks[0]?.weekLabel}</span>
          <span>{stats.salesLast12Weeks[stats.salesLast12Weeks.length - 1]?.weekLabel}</span>
        </div>
      </div>

      <div className="mt-4.5">
        <b className="mb-3 block">Recent orders</b>
        {stats.recentOrders.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-line-2 bg-white px-5 py-8 text-center text-ink-3">No orders yet.</p>
        ) : (
          <Table head={["Order", "Customer", "Items", "Value", "Payment", "Status"]}
            rows={stats.recentOrders.map((o) => [
              <b key="id">{o.orderNumber}</b>, o.customerName, o.itemsSummary, money(o.total),
              <Tag key="tag" ok={o.paid}>{o.paid ? "Paid" : "Pending"}</Tag>, o.status,
            ])} />
        )}
      </div>
    </div>
  );
}
