import type { Metadata } from "next";
import { Breadcrumb } from "@/components/Breadcrumb";
import { api } from "@/lib/api";
import { ShopClient } from "./ShopClient";
import type { ShopQuery } from "@/lib/types";

export const metadata: Metadata = {
  title: "Shop all oils and pack sizes",
  description: "Every pack the mill fills, from a 500 ml bottle to a 15 kg tin.",
};

export default async function ShopPage({
  searchParams,
}: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const initialQuery: ShopQuery = {
    oil: sp.oil ? (Array.isArray(sp.oil) ? sp.oil : [sp.oil]) : undefined,
    pack: sp.pack ? (Array.isArray(sp.pack) ? sp.pack : [sp.pack]) : undefined,
    q: typeof sp.q === "string" ? sp.q : undefined,
    sort: (typeof sp.sort === "string" ? sp.sort : "featured") as ShopQuery["sort"],
  };

  const [facets, firstPage] = await Promise.all([api.facets(), api.variants(initialQuery)]);

  return (
    <main>
      <header className="border-b border-line bg-paper-2 pb-9 pt-2">
        <div className="shell">
          <Breadcrumb items={[["Home", "/"], ["Shop"]]} />
          <h1 className="text-display">Every pack we fill</h1>
          <p className="mt-3.5 max-w-[60ch] text-ink-2">
            One list of all live variants across our oils. Filter by oil or pack size, or search a SKU straight from your last invoice.
          </p>
        </div>
      </header>
      <ShopClient facets={facets} initialPage={firstPage} initialQuery={initialQuery} />
    </main>
  );
}
