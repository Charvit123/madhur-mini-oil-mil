import Link from "next/link";

export function Breadcrumb({ items }: { items: [string, string?][] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap gap-2 py-4 text-sm text-ink-3">
      {items.map(([label, href], i) => (
        <span key={label} className="flex items-center gap-2">
          {i > 0 && <span aria-hidden>›</span>}
          {href ? <Link href={href} className="hover:text-ink">{label}</Link> : <span>{label}</span>}
        </span>
      ))}
    </nav>
  );
}
