"use client";
import { useEffect, useState } from "react";
import { useAdminAuth } from "@/store/adminAuth";
import {
  adminListVariants, adminUpdateVariant, adminRetireVariant, adminSetVariantStock,
  type VariantForm,
} from "@/lib/adminApi";
import type { AdminVariant } from "@/lib/types";
import { Field, StatusPill } from "../AdminForms";
import { money } from "@/lib/format";
import { exportCsv } from "@/lib/exportCsv";

/** Inventory is the same pack-size (variant) rows as Products → Pack sizes,
 *  just sorted by stock and focused on quick price/stock edits — "add new"
 *  lives on the Products page since a new inventory row needs a product and
 *  packaging picked first, exactly like adding a pack size there. */
export default function AdminInventoryPage() {
  const { token } = useAdminAuth();
  const [variants, setVariants] = useState<AdminVariant[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<AdminVariant | null>(null);

  function reload() {
    if (!token) return;
    adminListVariants(token).then(setVariants).catch((e) => setError(e instanceof Error ? e.message : "Could not load inventory."));
  }
  useEffect(reload, [token]);

  async function retire(v: AdminVariant) {
    if (!token) return;
    if (!confirm(`Retire "${v.sku}"? It stops being sold, but stays resolvable for past orders.`)) return;
    await adminRetireVariant(token, v.id);
    reload();
  }

  async function quickStock(v: AdminVariant, stock: number) {
    if (!token || stock < 0 || Number.isNaN(stock)) return;
    await adminSetVariantStock(token, v.id, stock);
    reload();
  }

  function doExport() {
    if (!variants) return;
    exportCsv("inventory.csv", variants.map((v) => ({
      SKU: v.sku, Product: v.productName, Oil: v.oilCategoryName, Packaging: v.packagingName,
      Price: v.price, MRP: v.mrp ?? "", Stock: v.stock, "Low stock threshold": v.lowStockThreshold,
      Batch: v.batchCode ?? "", Status: v.active ? "Active" : "Retired",
    })));
  }

  const sorted = variants ? [...variants].sort((a, b) => a.stock - b.stock) : null;

  return (
    <div>
      <div className="mb-5.5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[1.7rem]">Inventory</h1>
          <p className="text-sm text-ink-3">Every pack size, lowest stock first. Edit price/stock inline, or Edit for the full form.</p>
        </div>
        <button onClick={doExport} disabled={!variants?.length} className="rounded-control border border-line-2 bg-white px-4 py-2 text-sm font-semibold disabled:opacity-50">Export CSV</button>
      </div>

      {editing && token && (
        <VariantEditPanel token={token} variant={editing} onDone={() => { setEditing(null); reload(); }} onCancel={() => setEditing(null)} />
      )}

      {error ? (
        <div className="rounded-2xl border border-[#E7C3BD] bg-[#FCEDEA] px-5 py-5 text-[#7E241A]">{error}</div>
      ) : sorted === null ? (
        <div className="space-y-2">{[0, 1, 2].map((i) => <div key={i} className="h-14 animate-pulse rounded-2xl bg-paper-2" />)}</div>
      ) : (
        <div className="overflow-auto rounded-2xl border border-[#E6E3DC] bg-white">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>{["SKU", "Product", "Pack", "Price", "Stock", "Status", ""].map((h) => (
                <th key={h} className="border-b border-[#E6E3DC] px-3.5 py-3 text-left text-xs font-semibold text-[#7A756C]">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {sorted.map((v) => (
                <tr key={v.id}>
                  <td className="border-b border-[#F0EEE9] px-3.5 py-3 text-ink-3">{v.sku}</td>
                  <td className="border-b border-[#F0EEE9] px-3.5 py-3"><b>{v.productName}</b></td>
                  <td className="border-b border-[#F0EEE9] px-3.5 py-3">{v.packagingName}</td>
                  <td className="border-b border-[#F0EEE9] px-3.5 py-3">{money(v.price)}</td>
                  <td className="border-b border-[#F0EEE9] px-3.5 py-3">
                    <input type="number" min={0} defaultValue={v.stock} onBlur={(e) => {
                      const n = Number(e.target.value);
                      if (n !== v.stock) quickStock(v, n);
                    }} className="w-20 rounded-lg border border-line-2 px-2 py-1" />
                  </td>
                  <td className="border-b border-[#F0EEE9] px-3.5 py-3"><StatusPill active={v.active} /></td>
                  <td className="border-b border-[#F0EEE9] px-3.5 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => setEditing(v)} className="rounded-control border border-line-2 px-2.5 py-1.5 text-xs font-semibold">Edit</button>
                      {v.active && <button onClick={() => retire(v)} className="rounded-control border border-line-2 px-2.5 py-1.5 text-xs font-semibold text-err">Delete</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function VariantEditPanel({ token, variant, onDone, onCancel }: {
  token: string; variant: AdminVariant; onDone: () => void; onCancel: () => void;
}) {
  const [form, setForm] = useState<VariantForm>({
    productId: variant.productId, packagingId: variant.packagingId, sku: variant.sku,
    price: variant.price, mrp: variant.mrp, stock: variant.stock,
    lowStockThreshold: variant.lowStockThreshold, batchCode: variant.batchCode ?? "", active: variant.active,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await adminUpdateVariant(token, variant.id, form);
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save that row.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mb-5 rounded-2xl border border-[#E6E3DC] bg-white p-5">
      <b className="mb-3.5 block">Edit {variant.sku}</b>
      <div className="grid gap-3.5 sm:grid-cols-3">
        <Field label="Price (₹)">
          <input type="number" min={0} step="0.01" value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))}
            className="rounded-xl border border-line-2 px-4 py-2.5" />
        </Field>
        <Field label="MRP (₹, optional)">
          <input type="number" min={0} step="0.01" value={form.mrp ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, mrp: e.target.value ? Number(e.target.value) : undefined }))}
            className="rounded-xl border border-line-2 px-4 py-2.5" />
        </Field>
        <Field label="Stock">
          <input type="number" min={0} value={form.stock ?? 0}
            onChange={(e) => setForm((f) => ({ ...f, stock: Number(e.target.value) }))}
            className="rounded-xl border border-line-2 px-4 py-2.5" />
        </Field>
        <Field label="Low stock threshold">
          <input type="number" min={0} value={form.lowStockThreshold ?? 10}
            onChange={(e) => setForm((f) => ({ ...f, lowStockThreshold: Number(e.target.value) }))}
            className="rounded-xl border border-line-2 px-4 py-2.5" />
        </Field>
        <Field label="Batch code">
          <input value={form.batchCode ?? ""} onChange={(e) => setForm((f) => ({ ...f, batchCode: e.target.value }))}
            className="rounded-xl border border-line-2 px-4 py-2.5" />
        </Field>
        <Field label="Status">
          <select value={form.active ? "active" : "inactive"} onChange={(e) => setForm((f) => ({ ...f, active: e.target.value === "active" }))}
            className="rounded-xl border border-line-2 px-4 py-2.5">
            <option value="active">Active</option>
            <option value="inactive">Retired</option>
          </select>
        </Field>
      </div>
      {error && <p className="mt-3 text-sm text-err">{error}</p>}
      <div className="mt-4 flex gap-2.5">
        <button type="submit" disabled={busy} className="rounded-control bg-gold px-5 py-2.5 text-sm font-semibold text-[#2A1E07] disabled:opacity-60">
          {busy ? "Saving…" : "Save changes"}
        </button>
        <button type="button" onClick={onCancel} className="rounded-control border border-line-2 px-5 py-2.5 text-sm font-semibold">Cancel</button>
      </div>
    </form>
  );
}
