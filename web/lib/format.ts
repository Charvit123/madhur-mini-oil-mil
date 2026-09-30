const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

export const money = (n: number) => inr.format(n);

export function stockLabel(v: { stock: number; inStock: boolean; lowStock: boolean }) {
  if (!v.inStock) return { tone: "out" as const, text: "Out of stock at the mill" };
  if (v.lowStock) return { tone: "low" as const, text: `Only ${v.stock} left from this batch` };
  return { tone: "ok" as const, text: "In stock, ships within 24 hours" };
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
