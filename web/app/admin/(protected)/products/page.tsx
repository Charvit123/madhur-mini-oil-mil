"use client";
import { useEffect, useState } from "react";
import { useAdminAuth } from "@/store/adminAuth";
import {
  adminListOils, adminListPackagings, adminListProducts, adminListVariants,
  adminCreateProduct, adminUpdateProduct, adminRetireProduct, type ProductForm,
  adminCreateVariant, adminUpdateVariant, adminRetireVariant, type VariantForm,
} from "@/lib/adminApi";
import type { AdminOil, AdminPackaging, AdminProduct, AdminVariant } from "@/lib/types";
import { money } from "@/lib/format";
import { Field, StatusPill } from "../AdminForms";

export default function AdminProductsPage() {
  const { token } = useAdminAuth();
  const [oils, setOils] = useState<AdminOil[]>([]);
  const [packagings, setPackagings] = useState<AdminPackaging[]>([]);
  const [products, setProducts] = useState<AdminProduct[] | null>(null);
  const [variants, setVariants] = useState<AdminVariant[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [editingProduct, setEditingProduct] = useState<AdminProduct | "new" | null>(null);
  const [editingVariant, setEditingVariant] = useState<AdminVariant | "new" | null>(null);

  function reload() {
    if (!token) return;
    Promise.all([adminListOils(token), adminListPackagings(token), adminListProducts(token), adminListVariants(token)])
      .then(([o, p, pr, v]) => { setOils(o); setPackagings(p); setProducts(pr); setVariants(v); })
      .catch((e) => setError(e instanceof Error ? e.message : "Could not load products."));
  }
  useEffect(reload, [token]);

  async function retireProduct(p: AdminProduct) {
    if (!token) return;
    if (!confirm(`Retire "${p.name}"? It stops appearing anywhere for sale. Its pack sizes (variants) stay linked for past orders.`)) return;
    await adminRetireProduct(token, p.id);
    reload();
  }
  async function retireVariant(v: AdminVariant) {
    if (!token) return;
    if (!confirm(`Retire the ${v.packagingName} pack of "${v.productName}"? It stops being sold; past orders referencing it are unaffected.`)) return;
    await adminRetireVariant(token, v.id);
    reload();
  }

  if (error) return <div className="rounded-2xl border border-[#E7C3BD] bg-[#FCEDEA] px-5 py-5 text-[#7E241A]">{error}</div>;

  return (
    <div>
      <div className="mb-2">
        <h1 className="text-[1.7rem]">Products</h1>
        <p className="text-sm text-ink-3">
          A product is the recipe (e.g. "Double Filtered Groundnut Oil"). Each pack size you sell it in — 15 Kg Tin,
          1 Litre Bottle — is a separate <b>variant</b> below, with its own price, stock and SKU.
        </p>
      </div>

      {/* ---- Products ---- */}
      <section className="mt-5.5">
        <div className="mb-3 flex items-center justify-between">
          <b>Products (recipes)</b>
          <button onClick={() => setEditingProduct("new")} disabled={oils.length === 0}
            className="rounded-control bg-ink px-4 py-2 text-sm font-semibold text-[#FFF6E6] disabled:opacity-50"
            title={oils.length === 0 ? "Add an oil first" : undefined}>
            Add product
          </button>
        </div>

        {editingProduct && token && (
          <ProductFormPanel token={token} oils={oils} initial={editingProduct === "new" ? null : editingProduct}
            onDone={() => { setEditingProduct(null); reload(); }} onCancel={() => setEditingProduct(null)} />
        )}

        {products === null ? (
          <div className="space-y-2">{[0, 1].map((i) => <div key={i} className="h-14 animate-pulse rounded-2xl bg-paper-2" />)}</div>
        ) : products.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-line-2 bg-white px-5 py-8 text-center text-ink-3">No products yet — add one above.</p>
        ) : (
          <div className="overflow-auto rounded-2xl border border-[#E6E3DC] bg-white">
            <table className="w-full border-collapse text-sm">
              <thead><tr>{["Product", "Oil", "Slug", "Pack sizes", "Status", ""].map((h) => (
                <th key={h} className="border-b border-[#E6E3DC] px-3.5 py-3 text-left text-xs font-semibold text-[#7A756C]">{h}</th>
              ))}</tr></thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td className="border-b border-[#F0EEE9] px-3.5 py-3"><b>{p.name}</b>{p.featured && <span className="ml-2 text-xs text-gold-dark">★ featured</span>}</td>
                    <td className="border-b border-[#F0EEE9] px-3.5 py-3">{p.oilCategoryName}</td>
                    <td className="border-b border-[#F0EEE9] px-3.5 py-3 text-ink-3">{p.slug}</td>
                    <td className="border-b border-[#F0EEE9] px-3.5 py-3">{p.variantCount}</td>
                    <td className="border-b border-[#F0EEE9] px-3.5 py-3"><StatusPill active={p.active} /></td>
                    <td className="border-b border-[#F0EEE9] px-3.5 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => setEditingProduct(p)} className="rounded-control border border-line-2 px-2.5 py-1.5 text-xs font-semibold">Edit</button>
                        {p.active && <button onClick={() => retireProduct(p)} className="rounded-control border border-line-2 px-2.5 py-1.5 text-xs font-semibold text-err">Retire</button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ---- Variants ---- */}
      <section className="mt-7">
        <div className="mb-3 flex items-center justify-between">
          <b>Pack sizes (variants) — what's actually for sale</b>
          <button onClick={() => setEditingVariant("new")} disabled={products === null || products.length === 0}
            className="rounded-control bg-ink px-4 py-2 text-sm font-semibold text-[#FFF6E6] disabled:opacity-50"
            title={products && products.length === 0 ? "Add a product first" : undefined}>
            Add pack size
          </button>
        </div>

        {editingVariant && token && products && (
          <VariantFormPanel token={token} products={products} packagings={packagings}
            initial={editingVariant === "new" ? null : editingVariant}
            onDone={() => { setEditingVariant(null); reload(); }} onCancel={() => setEditingVariant(null)} />
        )}

        {variants === null ? (
          <div className="space-y-2">{[0, 1].map((i) => <div key={i} className="h-14 animate-pulse rounded-2xl bg-paper-2" />)}</div>
        ) : (
          <div className="overflow-auto rounded-2xl border border-[#E6E3DC] bg-white">
            <table className="w-full border-collapse text-sm">
              <thead><tr>{["SKU", "Product", "Pack", "Price", "MRP", "Stock", "Status", ""].map((h) => (
                <th key={h} className="border-b border-[#E6E3DC] px-3.5 py-3 text-left text-xs font-semibold text-[#7A756C]">{h}</th>
              ))}</tr></thead>
              <tbody>
                {variants.map((v) => (
                  <tr key={v.id}>
                    <td className="border-b border-[#F0EEE9] px-3.5 py-3 text-ink-3">{v.sku}</td>
                    <td className="border-b border-[#F0EEE9] px-3.5 py-3"><b>{v.productName}</b><br /><span className="text-[0.8rem] text-ink-3">{v.oilCategoryName}</span></td>
                    <td className="border-b border-[#F0EEE9] px-3.5 py-3">{v.packagingName}</td>
                    <td className="border-b border-[#F0EEE9] px-3.5 py-3">{money(v.price)}</td>
                    <td className="border-b border-[#F0EEE9] px-3.5 py-3">{v.mrp ? money(v.mrp) : "—"}</td>
                    <td className="border-b border-[#F0EEE9] px-3.5 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${v.stock === 0 ? "bg-[#FCEDEA] text-[#7E241A]" : v.stock <= v.lowStockThreshold ? "bg-gold-tint text-[#8A6208]" : "bg-[#E7F1E8] text-[#2F6B37]"}`}>
                        {v.stock === 0 ? "Out of stock" : v.stock}
                      </span>
                    </td>
                    <td className="border-b border-[#F0EEE9] px-3.5 py-3"><StatusPill active={v.active} /></td>
                    <td className="border-b border-[#F0EEE9] px-3.5 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => setEditingVariant(v)} className="rounded-control border border-line-2 px-2.5 py-1.5 text-xs font-semibold">Edit</button>
                        {v.active && <button onClick={() => retireVariant(v)} className="rounded-control border border-line-2 px-2.5 py-1.5 text-xs font-semibold text-err">Retire</button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function ProductFormPanel({ token, oils, initial, onDone, onCancel }: {
  token: string; oils: AdminOil[]; initial: AdminProduct | null; onDone: () => void; onCancel: () => void;
}) {
  const [form, setForm] = useState<ProductForm>(initial ? {
    oilCategoryId: initial.oilCategoryId, name: initial.name, slug: initial.slug,
    shortDescription: initial.shortDescription ?? "", description: initial.description ?? "",
    featured: initial.featured, sortOrder: initial.sortOrder, active: initial.active,
  } : { oilCategoryId: oils[0]?.id ?? "", name: "", slug: "", shortDescription: "", description: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function slugify(s: string) { return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""); }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.name.trim() || !form.slug.trim()) { setError("Name and slug are required."); return; }
    if (!form.oilCategoryId) { setError("Pick an oil."); return; }
    setBusy(true);
    try {
      if (initial) await adminUpdateProduct(token, initial.id, form);
      else await adminCreateProduct(token, form);
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save that product.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mb-5 rounded-2xl border border-[#E6E3DC] bg-white p-5">
      <b className="mb-3.5 block">{initial ? `Edit ${initial.name}` : "New product"}</b>
      <div className="grid gap-3.5 sm:grid-cols-2">
        <Field label="Oil category">
          <select value={form.oilCategoryId} onChange={(e) => setForm((f) => ({ ...f, oilCategoryId: e.target.value }))}
            className="rounded-xl border border-line-2 px-4 py-2.5">
            {oils.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
          </select>
        </Field>
        <Field label="Name">
          <input value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, slug: initial ? f.slug : slugify(e.target.value) }))}
            className="rounded-xl border border-line-2 px-4 py-2.5" placeholder="Double Filtered Groundnut Oil" />
        </Field>
        <Field label="Slug (used in the URL: /product/…)">
          <input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: slugify(e.target.value) }))}
            className="rounded-xl border border-line-2 px-4 py-2.5" placeholder="double-filtered-groundnut-oil" />
        </Field>
        <Field label="Short description">
          <input value={form.shortDescription} onChange={(e) => setForm((f) => ({ ...f, shortDescription: e.target.value }))}
            className="rounded-xl border border-line-2 px-4 py-2.5" />
        </Field>
        <Field label="Full description" full>
          <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className="min-h-[90px] rounded-xl border border-line-2 px-4 py-2.5" />
        </Field>
        <Field label="Featured on homepage?">
          <select value={form.featured ? "yes" : "no"} onChange={(e) => setForm((f) => ({ ...f, featured: e.target.value === "yes" }))}
            className="rounded-xl border border-line-2 px-4 py-2.5">
            <option value="no">No</option><option value="yes">Yes</option>
          </select>
        </Field>
        {initial && (
          <Field label="Status">
            <select value={form.active ? "active" : "inactive"} onChange={(e) => setForm((f) => ({ ...f, active: e.target.value === "active" }))}
              className="rounded-xl border border-line-2 px-4 py-2.5">
              <option value="active">Active</option><option value="inactive">Retired</option>
            </select>
          </Field>
        )}
      </div>
      {error && <p className="mt-3 text-sm text-err">{error}</p>}
      <div className="mt-4 flex gap-2.5">
        <button type="submit" disabled={busy} className="rounded-control bg-gold px-5 py-2.5 text-sm font-semibold text-[#2A1E07] disabled:opacity-60">
          {busy ? "Saving…" : initial ? "Save changes" : "Create product"}
        </button>
        <button type="button" onClick={onCancel} className="rounded-control border border-line-2 px-5 py-2.5 text-sm font-semibold">Cancel</button>
      </div>
    </form>
  );
}

function VariantFormPanel({ token, products, packagings, initial, onDone, onCancel }: {
  token: string; products: AdminProduct[]; packagings: AdminPackaging[]; initial: AdminVariant | null;
  onDone: () => void; onCancel: () => void;
}) {
  const [form, setForm] = useState<VariantForm>(initial ? {
    productId: initial.productId, packagingId: initial.packagingId, sku: initial.sku,
    price: initial.price, mrp: initial.mrp, stock: initial.stock, lowStockThreshold: initial.lowStockThreshold,
    batchCode: initial.batchCode ?? "", active: initial.active,
  } : { productId: products[0]?.id ?? "", packagingId: packagings[0]?.id ?? "", price: 0, stock: 0, lowStockThreshold: 10 });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.productId || !form.packagingId) { setError("Pick a product and a pack."); return; }
    if (!(form.price >= 0)) { setError("Price must be 0 or more."); return; }
    setBusy(true);
    try {
      if (initial) await adminUpdateVariant(token, initial.id, form);
      else await adminCreateVariant(token, form);
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save that pack size. (A duplicate SKU or an existing product+pack combination are the usual causes.)");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mb-5 rounded-2xl border border-[#E6E3DC] bg-white p-5">
      <b className="mb-3.5 block">{initial ? `Edit ${initial.productName} — ${initial.packagingName}` : "New pack size"}</b>
      <div className="grid gap-3.5 sm:grid-cols-2">
        <Field label="Product">
          <select value={form.productId} onChange={(e) => setForm((f) => ({ ...f, productId: e.target.value }))}
            className="rounded-xl border border-line-2 px-4 py-2.5">
            {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </Field>
        <Field label="Pack">
          <select value={form.packagingId} onChange={(e) => setForm((f) => ({ ...f, packagingId: e.target.value }))}
            className="rounded-xl border border-line-2 px-4 py-2.5">
            {packagings.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </Field>
        <Field label="SKU (leave blank to auto-generate)">
          <input value={form.sku ?? ""} onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
            className="rounded-xl border border-line-2 px-4 py-2.5" placeholder="MDH-GN-DF-15KT" />
        </Field>
        <div className="grid grid-cols-2 gap-2.5">
          <Field label="Price (₹, GST inclusive)">
            <input type="number" step="0.01" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))}
              className="rounded-xl border border-line-2 px-4 py-2.5" />
          </Field>
          <Field label="MRP (optional)">
            <input type="number" step="0.01" value={form.mrp ?? ""} onChange={(e) => setForm((f) => ({ ...f, mrp: e.target.value ? Number(e.target.value) : undefined }))}
              className="rounded-xl border border-line-2 px-4 py-2.5" />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <Field label="Stock">
            <input type="number" value={form.stock ?? 0} onChange={(e) => setForm((f) => ({ ...f, stock: Number(e.target.value) }))}
              className="rounded-xl border border-line-2 px-4 py-2.5" />
          </Field>
          <Field label="Low-stock threshold">
            <input type="number" value={form.lowStockThreshold ?? 10} onChange={(e) => setForm((f) => ({ ...f, lowStockThreshold: Number(e.target.value) }))}
              className="rounded-xl border border-line-2 px-4 py-2.5" />
          </Field>
        </div>
        <Field label="Batch code (optional)">
          <input value={form.batchCode ?? ""} onChange={(e) => setForm((f) => ({ ...f, batchCode: e.target.value }))}
            className="rounded-xl border border-line-2 px-4 py-2.5" />
        </Field>
        {initial && (
          <Field label="Status">
            <select value={form.active ? "active" : "inactive"} onChange={(e) => setForm((f) => ({ ...f, active: e.target.value === "active" }))}
              className="rounded-xl border border-line-2 px-4 py-2.5">
              <option value="active">Active</option><option value="inactive">Retired</option>
            </select>
          </Field>
        )}
      </div>
      {error && <p className="mt-3 text-sm text-err">{error}</p>}
      <div className="mt-4 flex gap-2.5">
        <button type="submit" disabled={busy} className="rounded-control bg-gold px-5 py-2.5 text-sm font-semibold text-[#2A1E07] disabled:opacity-60">
          {busy ? "Saving…" : initial ? "Save changes" : "Create pack size"}
        </button>
        <button type="button" onClick={onCancel} className="rounded-control border border-line-2 px-5 py-2.5 text-sm font-semibold">Cancel</button>
      </div>
    </form>
  );
}
