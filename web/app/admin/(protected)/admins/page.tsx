"use client";
import { useEffect, useState } from "react";
import { useAdminAuth } from "@/store/adminAuth";
import { adminListAdmins, adminCreateAdmin, adminDeactivate, adminReactivate } from "@/lib/adminApi";
import type { AdminUserView } from "@/lib/adminAuth";

export default function AdminAdminsPage() {
  const { token, admin: me } = useAdminAuth();
  const [admins, setAdmins] = useState<AdminUserView[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const isSuperAdmin = me?.role === "SUPER_ADMIN";

  function reload() {
    if (!token) return;
    adminListAdmins(token).then(setAdmins).catch((e) => setError(e instanceof Error ? e.message : "Could not load admins."));
  }

  useEffect(reload, [token]);

  if (!isSuperAdmin) {
    return (
      <div>
        <h1 className="text-[1.7rem]">Admins</h1>
        <div className="mt-5 rounded-2xl border border-dashed border-line-2 bg-white px-11 py-14 text-center text-ink-3">
          Only a super admin can view or manage admin logins. Ask one of them if you need a change here.
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-5.5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[1.7rem]">Admins</h1>
          <p className="text-sm text-ink-3">A handful of named logins — no self-service signup.</p>
        </div>
        <button onClick={() => setShowForm((s) => !s)} className="rounded-control bg-ink px-4 py-2 text-sm font-semibold text-[#FFF6E6]">
          {showForm ? "Cancel" : "Add admin"}
        </button>
      </div>

      {showForm && token && <CreateAdminForm token={token} onCreated={() => { setShowForm(false); reload(); }} />}

      {error ? (
        <div className="rounded-2xl border border-[#E7C3BD] bg-[#FCEDEA] px-5 py-5 text-[#7E241A]">{error}</div>
      ) : admins === null ? (
        <div className="space-y-2">{[0, 1].map((i) => <div key={i} className="h-14 animate-pulse rounded-2xl bg-paper-2" />)}</div>
      ) : (
        <div className="overflow-auto rounded-2xl border border-[#E6E3DC] bg-white">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                {["Username", "Name", "Role", "Status", "Last login", ""].map((h) => (
                  <th key={h} className="border-b border-[#E6E3DC] px-3.5 py-3 text-left text-xs font-semibold text-[#7A756C]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {admins.map((a) => (
                <tr key={a.id}>
                  <td className="border-b border-[#F0EEE9] px-3.5 py-3"><b>{a.username}</b></td>
                  <td className="border-b border-[#F0EEE9] px-3.5 py-3">{a.fullName || "—"}</td>
                  <td className="border-b border-[#F0EEE9] px-3.5 py-3">{a.role === "SUPER_ADMIN" ? "Super admin" : "Admin"}</td>
                  <td className="border-b border-[#F0EEE9] px-3.5 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${a.active ? "bg-[#E7F1E8] text-[#2F6B37]" : "bg-[#EDEAE3] text-[#5B5347]"}`}>
                      {a.active ? "Active" : "Deactivated"}
                    </span>
                  </td>
                  <td className="border-b border-[#F0EEE9] px-3.5 py-3 text-xs text-ink-3">
                    {a.lastLoginAt ? new Date(a.lastLoginAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "Never"}
                  </td>
                  <td className="border-b border-[#F0EEE9] px-3.5 py-3">
                    {token && a.id !== me?.id && (
                      <button
                        onClick={() => (a.active ? adminDeactivate(token, a.id) : adminReactivate(token, a.id)).then(reload)}
                        className="rounded-control border border-line-2 px-2.5 py-1.5 text-xs font-semibold"
                      >
                        {a.active ? "Deactivate" : "Reactivate"}
                      </button>
                    )}
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

function CreateAdminForm({ token, onCreated }: { token: string; onCreated: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"ADMIN" | "SUPER_ADMIN">("ADMIN");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (username.trim().length < 3) { setError("Username needs at least 3 characters."); return; }
    if (password.length < 8) { setError("Password needs at least 8 characters."); return; }
    setBusy(true);
    try {
      await adminCreateAdmin(token, { username: username.trim(), password, fullName: fullName.trim() || undefined, role });
      onCreated();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create that admin.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mb-5 rounded-2xl border border-[#E6E3DC] bg-white p-5">
      <div className="grid gap-3.5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-ink-2">Username</label>
          <input value={username} onChange={(e) => setUsername(e.target.value)} className="rounded-xl border border-line-2 px-4 py-2.5" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-ink-2">Temporary password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="rounded-xl border border-line-2 px-4 py-2.5" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-ink-2">Full name (optional)</label>
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="rounded-xl border border-line-2 px-4 py-2.5" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-ink-2">Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value as "ADMIN" | "SUPER_ADMIN")} className="rounded-xl border border-line-2 px-4 py-2.5">
            <option value="ADMIN">Admin</option>
            <option value="SUPER_ADMIN">Super admin</option>
          </select>
        </div>
      </div>
      {error && <p className="mt-3 text-sm text-err">{error}</p>}
      <button type="submit" disabled={busy} className="mt-4 rounded-control bg-gold px-5 py-2.5 text-sm font-semibold text-[#2A1E07] disabled:opacity-60">
        {busy ? "Creating…" : "Create admin"}
      </button>
    </form>
  );
}
