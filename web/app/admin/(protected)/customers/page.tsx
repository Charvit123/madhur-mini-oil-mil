"use client";
import { useEffect, useState } from "react";
import { useAdminAuth } from "@/store/adminAuth";
import { adminListCustomers, adminUpdateCustomer, adminDeactivateCustomer, adminReactivateCustomer, type CustomerForm } from "@/lib/adminApi";
import type { AdminCustomer } from "@/lib/types";
import { Field, StatusPill } from "../AdminForms";
import { formatDate } from "@/lib/format";
import { exportCsv } from "@/lib/exportCsv";

/** Customers sign themselves up by OTP at checkout or on /account — there's
 *  no "add new customer" button here for the same reason there's no "add new
 *  review": a fabricated customer record isn't a real thing to manage.
 *  Editing covers their name/email, and "delete" deactivates them (they can
 *  no longer sign in) rather than removing the row, since their past orders
 *  reference it and must stay resolvable. */
export default function AdminCustomersPage() {
  const { token } = useAdminAuth();
  const [customers, setCustomers] = useState<AdminCustomer[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<AdminCustomer | null>(null);

  function reload() {
    if (!token) return;
    adminListCustomers(token).then(setCustomers).catch((e) => setError(e instanceof Error ? e.message : "Could not load customers."));
  }
  useEffect(reload, [token]);

  async function deactivate(c: AdminCustomer) {
    if (!token) return;
    if (!confirm(`Deactivate ${c.name || c.phone}? They won't be able to sign in, but their order history stays intact. You can reactivate them any time.`)) return;
    await adminDeactivateCustomer(token, c.id);
    reload();
  }
  async function reactivate(c: AdminCustomer) { if (!token) return; await adminReactivateCustomer(token, c.id); reload(); }

  function doExport() {
    if (!customers) return;
    exportCsv("customers.csv", customers.map((c) => ({
      Phone: c.phone, Name: c.name ?? "", Email: c.email ?? "",
      "Phone verified": c.phoneVerified ? "Yes" : "No", Status: c.active ? "Active" : "Deactivated",
      "Joined": formatDate(c.createdAt),
    })));
  }

  return (
    <div>
      <div className="mb-5.5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[1.7rem]">Customers</h1>
          <p className="text-sm text-ink-3">Everyone who has signed in or ordered. Edit their contact details, or deactivate an account.</p>
        </div>
        <button onClick={doExport} disabled={!customers?.length} className="rounded-control border border-line-2 bg-white px-4 py-2 text-sm font-semibold disabled:opacity-50">Export CSV</button>
      </div>

      {editing && token && (
        <CustomerEditPanel token={token} customer={editing} onDone={() => { setEditing(null); reload(); }} onCancel={() => setEditing(null)} />
      )}

      {error ? (
        <div className="rounded-2xl border border-[#E7C3BD] bg-[#FCEDEA] px-5 py-5 text-[#7E241A]">{error}</div>
      ) : customers === null ? (
        <div className="space-y-2">{[0, 1, 2].map((i) => <div key={i} className="h-14 animate-pulse rounded-2xl bg-paper-2" />)}</div>
      ) : customers.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line-2 bg-white px-5 py-8 text-center text-ink-3">No customers yet.</p>
      ) : (
        <div className="overflow-auto rounded-2xl border border-[#E6E3DC] bg-white">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>{["Phone", "Name", "Email", "Joined", "Status", ""].map((h) => (
                <th key={h} className="border-b border-[#E6E3DC] px-3.5 py-3 text-left text-xs font-semibold text-[#7A756C]">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id}>
                  <td className="border-b border-[#F0EEE9] px-3.5 py-3"><b>{c.phone}</b></td>
                  <td className="border-b border-[#F0EEE9] px-3.5 py-3">{c.name || "—"}</td>
                  <td className="border-b border-[#F0EEE9] px-3.5 py-3 text-ink-3">{c.email || "—"}</td>
                  <td className="border-b border-[#F0EEE9] px-3.5 py-3 text-ink-3">{formatDate(c.createdAt)}</td>
                  <td className="border-b border-[#F0EEE9] px-3.5 py-3"><StatusPill active={c.active} /></td>
                  <td className="border-b border-[#F0EEE9] px-3.5 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => setEditing(c)} className="rounded-control border border-line-2 px-2.5 py-1.5 text-xs font-semibold">Edit</button>
                      {c.active
                        ? <button onClick={() => deactivate(c)} className="rounded-control border border-line-2 px-2.5 py-1.5 text-xs font-semibold text-err">Delete</button>
                        : <button onClick={() => reactivate(c)} className="rounded-control border border-line-2 px-2.5 py-1.5 text-xs font-semibold">Reactivate</button>}
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

function CustomerEditPanel({ token, customer, onDone, onCancel }: {
  token: string; customer: AdminCustomer; onDone: () => void; onCancel: () => void;
}) {
  const [form, setForm] = useState<CustomerForm>({ name: customer.name ?? "", email: customer.email ?? "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await adminUpdateCustomer(token, customer.id, form);
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save that customer.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mb-5 rounded-2xl border border-[#E6E3DC] bg-white p-5">
      <b className="mb-3.5 block">Edit {customer.phone}</b>
      <div className="grid gap-3.5 sm:grid-cols-2">
        <Field label="Name">
          <input value={form.name ?? ""} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="rounded-xl border border-line-2 px-4 py-2.5" />
        </Field>
        <Field label="Email">
          <input type="email" value={form.email ?? ""} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className="rounded-xl border border-line-2 px-4 py-2.5" />
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
