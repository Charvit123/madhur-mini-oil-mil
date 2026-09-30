import { AdminHeader, Kpi, Table, Tag } from "../AdminShell";
import { api } from "@/lib/api";

const ORDERS: [string, string, string, string, boolean, string][] = [
  ["MDH-24817", "Hetal Trivedi", "Groundnut 15 Kg Tin × 2", "₹5,700", true, "Packed"],
  ["MDH-24816", "Rakesh Bhanushali", "Cottonseed 15 Kg Tin × 6", "₹13,140", true, "Dispatched"],
  ["MDH-24815", "Mira Shah", "Sesame 1 L Bottle × 4", "₹1,980", false, "New"],
  ["MDH-24814", "Amit Rana", "Groundnut 5 L Tin × 1", "₹995", true, "Delivered"],
  ["MDH-24813", "Jigar Doshi", "Groundnut 10 Kg Bucket × 3", "₹5,730", false, "Closed"],
];
const BARS = [38, 44, 41, 55, 49, 62, 58, 71, 66, 78, 74, 88];

export default async function DashboardPage() {
  const facets = await api.facets();
  const low = facets.oils.filter((o) => o.variantCount < 4).length;

  return (
    <div>
      <AdminHeader section="Dashboard" />
      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Revenue, this month" value="₹8,42,600" note="+14% vs August" />
        <Kpi label="Orders" value="312" note="+22 this week" />
        <Kpi label="Awaiting dispatch" value="18" note="4 older than 24h" tone="warn" />
        <Kpi label="Live variants" value={String(facets.total)} note={`${low} categories thin on stock`} tone={low ? "err" : "ok"} />
      </div>

      <div className="mt-4.5 overflow-hidden rounded-2xl border border-[#E6E3DC] bg-white pb-3.5">
        <div className="flex justify-between px-3.5 pt-3.5"><b>Sales, last 12 weeks</b><span className="text-sm text-ink-3">₹ per week</span></div>
        <div className="flex h-[170px] items-end gap-2.5 p-4">
          {BARS.map((h, i) => <div key={i} style={{ height: `${h}%` }} className="flex-1 rounded-t bg-gradient-to-b from-[#E8B84D] to-[#C68C12]" />)}
        </div>
      </div>

      <div className="mt-4.5">
        <Table head={["Order", "Customer", "Items", "Value", "Payment", "Status"]}
          rows={ORDERS.map(([id, name, items, value, paid, status]) => [
            <b key="id">{id}</b>, name, items, value, <Tag key="tag" ok={paid}>{paid ? "Paid" : "Pending"}</Tag>, status,
          ])} />
      </div>
    </div>
  );
}
