import { AdminHeader, Table, Tag } from "../AdminShell";
import { products, reviews as allReviews } from "@/lib/data";

export default function AdminReviewsPage() {
  const rows = allReviews.map((r) => {
    const product = products.find((p) => p.id === r.productId)!;
    return [
      <div key={r.id}><b>{r.name}</b><br /><span className="text-[0.82rem] text-ink-3">{r.city}</span></div>,
      product.name, `${r.rating} / 5`, `${r.text.slice(0, 90)}…`,
      <Tag key="t" ok>Published</Tag>,
    ];
  });
  return (
    <div>
      <AdminHeader section="Reviews" />
      <Table head={["Customer", "Product", "Rating", "Review", "Status"]} rows={rows} />
    </div>
  );
}
