export const metadata = { title: "Policies" };

const SECTIONS: [string, string][] = [
  ["Privacy", "We keep your name, address, phone and order history to fulfil orders and nothing else. No data is sold or shared outside our courier and payment partners."],
  ["Terms", "Prices include GST and can change without notice. An order is confirmed only when payment clears or, for cash on delivery, when we call to verify."],
  ["Refunds", "Sealed food cannot be returned once opened. Leaking or damaged packs are replaced or refunded in full when reported with a photo within 48 hours of delivery."],
  ["Shipping", "Dispatch within 24 working hours. Gujarat 2 to 4 days, rest of India 4 to 7. Free delivery inside Gujarat above ₹1,499."],
];

export default function LegalPage() {
  return (
    <main className="shell max-w-[70ch] py-9 pb-24">
      <h1 className="text-[2rem]">Policies</h1>
      {SECTIONS.map(([t, d]) => (
        <div key={t}>
          <h2 className="mt-8 text-[1.3rem]">{t}</h2>
          <p className="mt-2.5 text-ink-3">{d}</p>
        </div>
      ))}
    </main>
  );
}
