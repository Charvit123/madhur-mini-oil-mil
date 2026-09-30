import { RequireAdmin } from "@/components/RequireAdmin";
import { AdminSidebar } from "./AdminSidebar";

/** Deliberately unlike the storefront chrome: dark sidebar, dense tables,
 *  same brand colours used as accents rather than backgrounds. Everything
 *  under this route group requires a valid admin session — RequireAdmin
 *  redirects to /admin/login otherwise, which lives outside this group so
 *  it isn't itself caught by the same gate. */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAdmin>
      <div className="grid min-h-screen bg-[#F6F6F4] lg:grid-cols-[246px_1fr]">
        <AdminSidebar />
        <main className="p-4.5 sm:p-8">{children}</main>
      </div>
    </RequireAdmin>
  );
}
