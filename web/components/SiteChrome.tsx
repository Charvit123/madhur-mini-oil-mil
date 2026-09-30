"use client";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import type { OilSummary } from "@/lib/types";

/**
 * The public storefront's Navbar/Footer/CartDrawer, kept out of the admin
 * panel. RootLayout wraps *everything* (storefront and /admin alike) in one
 * <body>, so the only way to tell them apart is at render time by path —
 * hence this being a client component rather than two separate layouts.
 * The admin panel builds its own chrome entirely (AdminSidebar, in
 * app/admin/(protected)/layout.tsx); it never needs the customer-facing nav,
 * footer or cart drawer.
 */
export function SiteChrome({ oils, children }: { oils: OilSummary[]; children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) return <>{children}</>;

  return (
    <>
      <Navbar oils={oils} />
      {children}
      <Footer oils={oils} />
      <CartDrawer />
    </>
  );
}
