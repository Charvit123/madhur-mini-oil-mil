"use client";
import { useEffect, useState } from "react";
import { useAdminAuth } from "@/store/adminAuth";
import { adminListOils, adminCreateOil, adminUpdateOil, adminRetireOil, type OilForm } from "@/lib/adminApi";
import type { AdminOil } from "@/lib/types";
import { Field, StatusPill } from "../AdminForms";

const emptyForm: OilForm = { name: "", slug: "", tagline: "", description: "", oilColor: "#D79B1E", seedColor: "" };

export default function AdminOilsPage() {
  const { token } = useAdminAuth();
  const [oils, setOils] = useState<AdminOil[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<AdminOil | "new" | null>(null);

  function reload() {
    if (!token) return;
    adminListOils(token).then(setOils).catch((e) => setError(e instanceof Error ? e.message : "Could not load oils."));
  }
  useEffect(reload, [token]);

  async function retire(o: AdminOil) {
    if (!token) return;
    if (!confirm(`Retire "${o.name}"? It disappears from the storefront but stays resolvable for past orders. You can bring it back by editing it and switching it to Active.`)) return;
    await adminRetireOil(token, o.id);
    reload();
  }

  return (
    <div>
      <div className="mb-5.5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[1.7rem]">Oils</h1>
          <p className="text-sm text-ink-3">The top of the catalogue tree — add one and a category page, shop filter and footer link appear with no code change.</p>
        </div>
        <button onClick={() => setEditing("new")} className="rounded-control bg-ink px-4 py-2 text-sm font-semibold text-[#FFF6E6]">Add oil</button>
      </div>

      {editing && token && (
        <OilFormPanel
          token={token}
          initial={editing === "new" ? null : editing}
          onDone={() => { setEditing(null); reload(); }}
          onCancel={() => setEditing(null)}
        />
      )}

      {error ? (
        <div className="rounded-2xl border border-[#E7C3BD] bg-[#FCEDEA] px-5 py-5 text-[#7E241A]">{error}</div>
      ) : oils === null ? (
        <div className="space-y-2">{[0, 1].map((i) => <div key={i} className="h-14 animate-pulse rounded-2xl bg-paper-2" />)}</div>
      ) : (
        <div className="overflow-auto rounded-2xl border border-[#E6E3DC] bg-white">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>{["Oil", "Slug", "Products", "Swatch", "Status", ""].map((h) => (
                <th key={h} className="border-b border-[#E6E3DC] px-3.5 py-3 text-left text-xs font-semibold text-[#7A756C]">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {oils.map((o) => (
                <tr key={o.id}>
                  <td className="border-b border-[#F0EEE9] px-3.5 py-3"><b>{o.name}</b><br /><span className="text-[0.82rem] text-ink-3">{o.tagline}</span></td>
                  <td className="border-b border-[#F0EEE9] px-3.5 py-3 text-ink-3">{o.slug}</td>
                  <td className="border-b border-[#F0EEE9] px-3.5 py-3">{o.productCount}</td>
                  <td className="border-b border-[#F0EEE9] px-3.5 py-3"><span className="inline-block h-5.5 w-5.5 rounded-md" style={{ background: o.oilColor }} /></td>
                  <td className="border-b border-[#F0EEE9] px-3.5 py-3"><StatusPill active={o.active} /></td>
                  <td className="border-b border-[#F0EEE9] px-3.5 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => setEditing(o)} className="rounded-control border border-line-2 px-2.5 py-1.5 text-xs font-semibold">Edit</button>
                      {o.active && <button onClick={() => retire(o)} className="rounded-control border border-line-2 px-2.5 py-1.5 text-xs font-semibold text-err">Retire</button>}
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

function OilFormPanel({ token, initial, onDone, onCancel }: {
  token: string; initial: AdminOil | null; onDone: () => void; onCancel: () => void;
}) {
  const [form, setForm] = useState<OilForm>(initial ? {
    name: initial.name, slug: initial.slug, tagline: initial.tagline ?? "", description: initial.description ?? "",
    oilColor: initial.oilColor, seedColor: initial.seedColor ?? "", sortOrder: initial.sortOrder, active: initial.active,
  } : emptyForm);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function slugify(s: string) { return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""); }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.name.trim() || !form.slug.trim()) { setError("Name and slug are required."); return; }
    if (!/^#[0-9a-fA-F]{6}$/.test(form.oilColor)) { setError("Oil colour must be a hex code like #D79B1E."); return; }
    setBusy(true);
    try {
      if (initial) await adminUpdateOil(token, initial.id, form);
      else await adminCreateOil(token, form);
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save that oil.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mb-5 rounded-2xl border border-[#E6E3DC] bg-white p-5">
      <b className="mb-3.5 block">{initial ? `Edit ${initial.name}` : "New oil"}</b>
      <div className="grid gap-3.5 sm:grid-cols-2">
        <Field label="Name">
          <input value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, slug: initial ? f.slug : slugify(e.target.value) }))}
            className="rounded-xl border border-line-2 px-4 py-2.5" placeholder="Groundnut Oil" />
        </Field>
        <Field label="Slug (used in the URL: /shop/…)">
          <input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: slugify(e.target.value) }))}
            className="rounded-xl border border-line-2 px-4 py-2.5" placeholder="groundnut-oil" />
        </Field>
        <Field label="Tagline">
          <input value={form.tagline} onChange={(e) => setForm((f) => ({ ...f, tagline: e.target.value }))}
            className="rounded-xl border border-line-2 px-4 py-2.5" placeholder="Cold-pressed, double filtered" />
        </Field>
        <Field label="Swatch colour (hex)">
          <div className="flex items-center gap-2.5">
            <input type="color" value={form.oilColor} onChange={(e) => setForm((f) => ({ ...f, oilColor: e.target.value }))} className="h-10 w-14 rounded-lg border border-line-2" />
            <input value={form.oilColor} onChange={(e) => setForm((f) => ({ ...f, oilColor: e.target.value }))} className="rounded-xl border border-line-2 px-4 py-2.5" />
          </div>
        </Field>
        <Field label="Description" full>
          <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className="min-h-[90px] rounded-xl border border-line-2 px-4 py-2.5" />
        </Field>
        {initial && (
          <Field label="Status">
            <select value={form.active ? "active" : "inactive"} onChange={(e) => setForm((f) => ({ ...f, active: e.target.value === "active" }))}
              className="rounded-xl border border-line-2 px-4 py-2.5">
              <option value="active">Active</option>
              <option value="inactive">Retired</option>
            </select>
          </Field>
        )}
      </div>
      {error && <p className="mt-3 text-sm text-err">{error}</p>}
      <div className="mt-4 flex gap-2.5">
        <button type="submit" disabled={busy} className="rounded-control bg-gold px-5 py-2.5 text-sm font-semibold text-[#2A1E07] disabled:opacity-60">
          {busy ? "Saving…" : initial ? "Save changes" : "Create oil"}
        </button>
        <button type="button" onClick={onCancel} className="rounded-control border border-line-2 px-5 py-2.5 text-sm font-semibold">Cancel</button>
      </div>
    </form>
  );
}
