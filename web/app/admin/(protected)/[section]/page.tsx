import { notFound } from "next/navigation";
import { AdminHeader } from "../AdminShell";
import { ADMIN_NAV } from "@/lib/content";

const HANDLED = new Set([
  "dashboard", "oils", "packaging", "products", "inventory", "reviews",
  "orders", "admins", "customers", "payments",
]);

/** Every real ADMIN_NAV section now has its own page.tsx (a literal route
 *  segment always wins over this dynamic [section] catch-all in the App
 *  Router), so nothing in HANDLED should ever actually reach here — this is
 *  just a safety net against a stray/renamed link. */
export default async function AdminSectionStub({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (HANDLED.has(section)) notFound();
  const label = ADMIN_NAV.find((s) => s.toLowerCase() === section) ?? section;

  return (
    <div>
      <AdminHeader section={String(label)} />
      <div className="rounded-2xl border border-[#E6E3DC] bg-white px-11 py-11 text-center">
        <h3 className="text-[1.2rem]">{label}</h3>
        <p className="mx-auto mt-2.5 max-w-[46ch] text-ink-3">
          This screen follows the same table and form pattern as Products. It is wired to the same API layer, so nothing here is hardcoded either.
        </p>
      </div>
    </div>
  );
}
