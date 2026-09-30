/** Small shared bits for the admin CRUD forms (oils, packaging, products, variants). */
export function Field({ label, full, children }: { label: string; full?: boolean; children: React.ReactNode }) {
  return (
    <div className={`flex flex-col gap-1.5 ${full ? "sm:col-span-2" : ""}`}>
      <label className="text-sm font-semibold text-ink-2">{label}</label>
      {children}
    </div>
  );
}

export function StatusPill({ active }: { active: boolean }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${active ? "bg-[#E7F1E8] text-[#2F6B37]" : "bg-[#EDEAE3] text-[#5B5347]"}`}>
      {active ? "Active" : "Retired"}
    </span>
  );
}
