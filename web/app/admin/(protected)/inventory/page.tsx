import { AdminHeader, Table, Tag } from "../AdminShell";
import { api } from "@/lib/api";
import { money } from "@/lib/format";

export default async function AdminInventoryPage() {
  const { items } = await api.variants({ size: 60, sort: "featured" });
  const sorted = [...items].sort((a, b) => a.stock - b.stock);
  return (
    <div>
      <AdminHeader section="Inventory" />
      <Table head={["SKU", "Product", "Pack", "Price", "Stock"]}
        rows={sorted.map((v) => [
          v.sku, v.productName, v.packaging.name, money(v.price),
          <Tag key="t" ok={v.stock > 10}>{v.stock === 0 ? "Out of stock" : v.stock}</Tag>,
        ])} />
    </div>
  );
}
