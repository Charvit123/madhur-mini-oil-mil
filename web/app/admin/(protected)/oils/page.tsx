import { AdminHeader, Table } from "../AdminShell";
import { api } from "@/lib/api";

export default async function AdminOilsPage() {
  const oils = await api.oils();
  return (
    <div>
      <AdminHeader section="Oils" />
      <Table head={["Oil", "Slug", "Variants", "Swatch", ""]}
        rows={oils.map((o) => [
          <div key={o.id}><b>{o.name}</b><br /><span className="text-[0.82rem] text-ink-3">{o.tagline}</span></div>,
          o.slug, String(o.variantCount),
          <span key="c" className="inline-block h-5.5 w-5.5 rounded-md" style={{ background: o.oilColor }} />,
          <a key="v" href={`/shop/${o.slug}`} className="text-sm font-semibold text-olive-dark">View on site</a>,
        ])} />
      <p className="mt-3.5 text-[0.88rem] text-ink-3">Adding an oil here publishes a new category page, filter option and footer link with no frontend release.</p>
    </div>
  );
}
