import { Breadcrumb } from "@/components/Breadcrumb";
import { ContactForm } from "@/components/ContactForm";

export const metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <main>
      <div className="border-b border-line bg-paper-2 pb-9 pt-2">
        <div className="shell">
          <Breadcrumb items={[["Home", "/"], ["Contact"]]} />
          <h1 className="text-display">Talk to the mill</h1>
          <p className="mt-3.5 max-w-[60ch] text-ink-2">Orders, bulk quotes, a question about a batch code, or directions if you are driving down. The phone is answered by someone on the floor.</p>
        </div>
      </div>

      <section className="py-14">
        <div className="shell grid items-start gap-6 lg:grid-cols-[1fr_360px] lg:gap-11">
          <div className="rounded-panel border border-line bg-card p-5.5">
            <h3 className="text-[1.15rem]">Send a message</h3>
            <ContactForm />
          </div>
          <div className="grid gap-4">
            <div className="rounded-panel border border-line bg-card p-5.5">
              <h3 className="text-[1.1rem]">Madhur Mini Oil Mill</h3>
              <p className="mt-2 text-[0.95rem] text-ink-3">Survey 214, Gondal Road,<br />Opp. Krishna Weighbridge,<br />Rajkot 360004, Gujarat</p>
              <p className="mt-3.5 text-[0.95rem]"><b>+91 98250 00000</b><br />orders@madhuroil.in</p>
              <div className="mt-4 flex flex-wrap gap-2.5">
                <a href="tel:+919825000000" className="rounded-control bg-olive px-4 py-2 text-sm font-semibold text-[#F4F7EA]">Call now</a>
                <a href="/contact" className="rounded-control border border-line-2 px-4 py-2 text-sm font-semibold">Chat on WhatsApp</a>
              </div>
            </div>
            <div className="rounded-panel border border-line bg-card p-5.5">
              <h3 className="text-[1.1rem]">Open hours</h3>
              <Row label="Monday to Friday" value="9am – 7pm" />
              <Row label="Saturday" value="9am – 4pm" />
              <Row label="Sunday" value="Closed" />
            </div>
            <div className="overflow-hidden rounded-panel border border-line bg-card">
              <div className="relative aspect-[16/10]" style={{
                background: "repeating-linear-gradient(90deg,#EDE7D8 0 38px,#E4DCC8 38px 40px), repeating-linear-gradient(0deg,#EDE7D8 0 38px,#E4DCC8 38px 40px)",
              }}>
                <div className="absolute inset-x-0 bottom-0 h-[34%] bg-[#DCE5D0]" />
                <div className="absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-full text-center">
                  <svg width={34} height={34} viewBox="0 0 24 24" fill="#B3541E" className="mx-auto"><path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z" /></svg>
                  <div className="rounded-lg border border-line bg-white px-2 py-0.5 text-xs font-bold">The mill</div>
                </div>
              </div>
              <div className="p-3.5"><a href="/contact" className="block rounded-control border border-line-2 py-2.5 text-center text-sm font-semibold">Open directions in Maps</a></div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between py-1 text-sm text-ink-2"><span>{label}</span><span>{value}</span></div>;
}
