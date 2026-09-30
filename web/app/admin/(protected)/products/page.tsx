import { AdminHeader, Table, Tag } from "../AdminShell";
import { api } from "@/lib/api";
import { money } from "@/lib/format";

export default async function AdminProductsPage() {
  const { items } = await api.variants({ size: 60 });
  return (
    <div>
      <AdminHeader section="Products" />
      <Table head={["SKU", "Product", "Oil", "Pack", "Price", "MRP", "Stock"]}
        rows={items.map((v) => [
          v.sku, v.productName, v.oilName, v.packaging.name, money(v.price), v.mrp ? money(v.mrp) : "—",
          <Tag key="t" ok={v.stock > 10}>{v.stock === 0 ? "Out of stock" : v.stock}</Tag>,
        ])} />
    </div>
  );
}
