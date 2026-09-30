"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogoMark } from "@/components/Logo";
import { ADMIN_NAV } from "@/lib/content";
import { useAdminAuth } from "@/store/adminAuth";

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { admin, logout } = useAdminAuth();

  return (
    <nav className="flex flex-col gap-1 bg-[#1C1A17] p-4 text-[#CFC7BC]">
      <div className="mb-4.5 flex items-center gap-2.5 px-2.5 py-1.5">
        <LogoMark dark />
        <span className="flex flex-col leading-none">
          <span className="font-display text-[1.1rem] font-bold text-white">Madhur</span>
          <span className="text-[0.6rem] uppercase tracking-[0.2em] text-[#8F8879]">Admin</span>
        </span>
      </div>

      {ADMIN_NAV.map((s) => {
        const href = `/admin/${s.toLowerCase()}`;
        const active = pathname === href;
        return (
          <Link key={s} href={href}
                className={`rounded-lg px-3.5 py-2.5 text-sm ${active ? "bg-gold font-semibold text-[#2A1E07]" : "hover:bg-white/10 hover:text-white"}`}>
            {s}
          </Link>
        );
      })}

      <div className="mt-auto space-y-2 border-t border-white/10 pt-4">
        {admin && (
          <div className="px-2.5 text-xs">
            <b className="block text-[#E8E1D6]">{admin.fullName || admin.username}</b>
            <span className="text-[#8F8879]">{admin.role === "SUPER_ADMIN" ? "Super admin" : "Admin"}</span>
          </div>
        )}
        <button onClick={() => { logout(); router.replace("/admin/login"); }}
                className="w-full rounded-lg px-3.5 py-2 text-left text-sm text-[#CFC7BC] hover:bg-white/10 hover:text-white">
          Log out
        </button>
        <Link href="/" className="block px-2.5 text-sm text-[#8F8879]">← Back to storefront</Link>
      </div>
    </nav>
  );
}
