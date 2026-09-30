export function AdminHeader({ section }: { section: string }) {
  return (
    <div className="mb-5.5 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="text-[1.7rem]">{section}</h1>
        <p className="text-sm text-ink-3">Wednesday, 23 September 2026 · Rajkot unit</p>
      </div>
      <div className="flex gap-2.5">
        <button className="rounded-control border border-line-2 bg-white px-4 py-2 text-sm font-semibold">Export CSV</button>
        <button className="rounded-control bg-ink px-4 py-2 text-sm font-semibold text-[#FFF6E6]">Add new</button>
      </div>
    </div>
  );
}

export function Kpi({ label, value, note, tone }: { label: string; value: string; note: string; tone?: "ok" | "warn" | "err" }) {
  return (
    <div className="rounded-2xl border border-[#E6E3DC] bg-white p-4.5">
      <span className="text-[0.8rem] text-[#7A756C]">{label}</span>
      <b className="mt-1.5 block font-display text-[1.8rem]">{value}</b>
      <i className={`text-[0.78rem] font-semibold not-italic ${tone === "warn" ? "text-warn" : tone === "err" ? "text-err" : "text-ok"}`}>{note}</i>
    </div>
  );
}

export function Table({ head, rows }: { head: string[]; rows: React.ReactNode[][] }) {
  return (
    <div className="overflow-auto rounded-2xl border border-[#E6E3DC] bg-white">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>{head.map((h) => <th key={h} className="border-b border-[#E6E3DC] px-3.5 py-3 text-left text-xs font-semibold text-[#7A756C]">{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>{r.map((c, j) => <td key={j} className="border-b border-[#F0EEE9] px-3.5 py-3">{c}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Tag({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${ok ? "bg-[#E7F1E8] text-[#2F6B37]" : "bg-gold-tint text-[#8A6208]"}`}>{children}</span>;
}
