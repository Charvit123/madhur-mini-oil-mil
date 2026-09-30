"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogoMark } from "@/components/Logo";
import { useAdminAuth } from "@/store/adminAuth";
import { adminLogin, AdminAuthApiError } from "@/lib/adminAuth";

export default function AdminLoginPage() {
  const router = useRouter();
  const setSession = useAdminAuth((s) => s.setSession);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await adminLogin(username.trim(), password);
      setSession(res.token, res.admin);
      router.replace("/admin/dashboard");
    } catch (e) {
      setError(e instanceof AdminAuthApiError ? e.message : "Could not sign in.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#1C1A17] px-4">
      <div className="w-full max-w-[380px]">
        <div className="mb-6 flex items-center justify-center gap-2.5">
          <LogoMark dark />
          <span className="flex flex-col leading-none">
            <span className="font-display text-[1.2rem] font-bold text-white">Madhur</span>
            <span className="text-[0.62rem] uppercase tracking-[0.22em] text-[#8F8879]">Admin</span>
          </span>
        </div>

        <form onSubmit={submit} className="rounded-panel bg-white p-6">
          <h1 className="text-[1.3rem]">Sign in</h1>
          <p className="mt-1 text-sm text-ink-3">Staff access only.</p>

          <div className="mt-5 flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-ink-2">Username</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username"
                   className="rounded-xl border border-line-2 bg-white px-4 py-3" />
          </div>
          <div className="mt-3.5 flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-ink-2">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password"
                   className="rounded-xl border border-line-2 bg-white px-4 py-3" />
          </div>

          {error && <p className="mt-3.5 rounded-card border border-[#E7C3BD] bg-[#FCEDEA] px-4 py-3 text-sm text-[#7E241A]">{error}</p>}

          <button type="submit" disabled={busy} className="mt-5 w-full rounded-control bg-ink py-3 font-semibold text-[#FFF6E6] disabled:opacity-60">
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}
