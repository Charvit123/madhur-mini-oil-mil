"use client";
import { useEffect, useState } from "react";
import { useAdminAuth } from "@/store/adminAuth";
import { adminListPackagings, adminCreatePackaging, adminUpdatePackaging, adminRetirePackaging, type PackagingForm } from "@/lib/adminApi";
import type { AdminPackaging, PackagingKind, Unit } from "@/lib/types";
import { PackArt } from "@/components/PackArt";
import { Field, StatusPill } from "../AdminForms";

const KINDS: PackagingKind[] = ["TIN", "BUCKET", "JAR", "BOTTLE", "POUCH", "CARTON"];
const UNITS: Unit[] = ["KG", "LITRE", "ML", "GRAM"];
const emptyForm: PackagingForm = { name: "", code: "", kind: "TIN", size: 1, unit: "LITRE" };

export default function AdminPackagingPage() {
  const { token } = useAdminAuth();
  const [packagings, setPackagings] = useState<AdminPackaging[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<AdminPackaging | "new" | null>(null);

  function reload() {
    if (!token) return;
    adminListPackagings(token).then(setPackagings).catch((e) => setError(e instanceof Error ? e.message : "Could not load packaging."));
  }
  useEffect(reload, [token]);

  async function retire(p: AdminPackaging) {
    if (!token) return;
    if (!confirm(`Retire "${p.name}"? It stops being offered on new products but existing variants keep it.`)) return;
    await adminRetirePackaging(token, p.id);
    reload();
  }

  return (
    <div>
      <div className="mb-5.5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[1.7rem]">Packaging</h1>
          <p className="text-sm text-ink-3">Reusable containers — one pack (e.g. "15 Kg Tin") is shared across every oil.</p>
        </div>
        <button onClick={() => setEditing("new")} className="rounded-control bg-ink px-4 py-2 text-sm font-semibold text-[#FFF6E6]">Add packaging</button>
      </div>

      {editing && token && (
        <PackagingFormPanel token={token} initial={editing === "new" ? null : editing}
          onDone={() => { setEditing(null); reload(); }} onCancel={() => setEditing(null)} />
      )}

      {error ? (
        <div className="rounded-2xl border border-[#E7C3BD] bg-[#FCEDEA] px-5 py-5 text-[#7E241A]">{error}</div>
      ) : packagings === null ? (
        <div className="space-y-2">{[0, 1].map((i) => <div key={i} className="h-14 animate-pulse rounded-2xl bg-paper-2" />)}</div>
      ) : (
        <div className="overflow-auto rounded-2xl border border-[#E6E3DC] bg-white">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>{["Pack", "Code", "Type", "Size", "Status", "Preview", ""].map((h) => (
                <th key={h} className="border-b border-[#E6E3DC] px-3.5 py-3 text-left text-xs font-semibold text-[#7A756C]">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {packagings.map((p) => (
                <tr key={p.id}>
                  <td className="border-b border-[#F0EEE9] px-3.5 py-3"><b>{p.name}</b></td>
                  <td className="border-b border-[#F0EEE9] px-3.5 py-3 text-ink-3">{p.code}</td>
                  <td className="border-b border-[#F0EEE9] px-3.5 py-3">{p.kind}</td>
                  <td className="border-b border-[#F0EEE9] px-3.5 py-3">{p.shortLabel}</td>
                  <td className="border-b border-[#F0EEE9] px-3.5 py-3"><StatusPill active={p.active} /></td>
                  <td className="border-b border-[#F0EEE9] px-3.5 py-3"><div className="h-14 w-10"><PackArt kind={p.kind} color="#D79B1E" label={p.name} /></div></td>
                  <td className="border-b border-[#F0EEE9] px-3.5 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => setEditing(p)} className="rounded-control border border-line-2 px-2.5 py-1.5 text-xs font-semibold">Edit</button>
                      {p.active && <button onClick={() => retire(p)} className="rounded-control border border-line-2 px-2.5 py-1.5 text-xs font-semibold text-err">Retire</button>}
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

function PackagingFormPanel({ token, initial, onDone, onCancel }: {
  token: string; initial: AdminPackaging | null; onDone: () => void; onCancel: () => void;
}) {
  const [form, setForm] = useState<PackagingForm>(initial ? {
    name: initial.name, code: initial.code, kind: initial.kind, size: initial.size, unit: initial.unit,
    sortOrder: initial.sortOrder, active: initial.active,
  } : emptyForm);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.name.trim() || !form.code.trim()) { setError("Name and code are required."); return; }
    if (!(form.size > 0)) { setError("Size must be a positive number."); return; }
    setBusy(true);
    try {
      if (initial) await adminUpdatePackaging(token, initial.id, form);
      else await adminCreatePackaging(token, form);
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save that packaging.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mb-5 rounded-2xl border border-[#E6E3DC] bg-white p-5">
      <b className="mb-3.5 block">{initial ? `Edit ${initial.name}` : "New packaging"}</b>
      <div className="grid gap-3.5 sm:grid-cols-2">
        <Field label="Name">
          <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="rounded-xl border border-line-2 px-4 py-2.5" placeholder="15 Kg Tin" />
        </Field>
        <Field label="Code (unique, e.g. TIN-15KG)">
          <input value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
            className="rounded-xl border border-line-2 px-4 py-2.5" placeholder="TIN-15KG" />
        </Field>
        <Field label="Container type">
          <select value={form.kind} onChange={(e) => setForm((f) => ({ ...f, kind: e.target.value as PackagingKind }))}
            className="rounded-xl border border-line-2 px-4 py-2.5">
            {KINDS.map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-2.5">
          <Field label="Size">
            <input type="number" step="0.001" value={form.size} onChange={(e) => setForm((f) => ({ ...f, size: Number(e.target.value) }))}
              className="rounded-xl border border-line-2 px-4 py-2.5" />
          </Field>
          <Field label="Unit">
            <select value={form.unit} onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value as Unit }))}
              className="rounded-xl border border-line-2 px-4 py-2.5">
              {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
          </Field>
        </div>
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
          {busy ? "Saving…" : initial ? "Save changes" : "Create packaging"}
        </button>
        <button type="button" onClick={onCancel} className="rounded-control border border-line-2 px-5 py-2.5 text-sm font-semibold">Cancel</button>
      </div>
    </form>
  );
}
