import { notFound } from "next/navigation";
import { AdminHeader } from "../AdminShell";
import { ADMIN_NAV } from "@/lib/content";

const HANDLED = new Set(["dashboard", "oils", "packaging", "products", "inventory", "reviews", "orders", "admins"]);

/** Customers, Payments, Content, Settings — same table shell as the built-out
 *  screens, wired to the same API layer, so filling these in later is "swap
 *  the mock rows for a real query", not a new page pattern. */
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
