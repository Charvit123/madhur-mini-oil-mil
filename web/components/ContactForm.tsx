"use client";
import { toast } from "./Toast";

export function ContactForm() {
  return (
    <form className="mt-4" onSubmit={(e) => { e.preventDefault(); e.currentTarget.reset(); toast("Message sent, we reply within a working day", "ok"); }}>
      <div className="grid gap-3.5 sm:grid-cols-2">
        <Field label="Name" required />
        <Field label="Mobile" required />
      </div>
      <div className="mb-3.5 flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-ink-2">What is this about?</label>
        <select className="rounded-xl border border-line-2 bg-white px-4 py-3">
          <option>Placing an order</option><option>Bulk or wholesale quote</option>
          <option>Question about a batch</option><option>Delivery or damage</option><option>Something else</option>
        </select>
      </div>
      <div className="mb-3.5 flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-ink-2">Message</label>
        <textarea rows={5} className="rounded-xl border border-line-2 bg-white px-4 py-3" />
      </div>
      <button type="submit" className="rounded-control bg-ink px-6 py-3 font-semibold text-[#FFF6E6]">Send message</button>
    </form>
  );
}
function Field({ label, required }: { label: string; required?: boolean }) {
  return (
    <div className="mb-3.5 flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-ink-2">{label}</label>
      <input required={required} className="rounded-xl border border-line-2 bg-white px-4 py-3" />
    </div>
  );
}
