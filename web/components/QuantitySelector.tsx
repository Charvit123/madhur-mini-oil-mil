"use client";
export function QuantitySelector({ value, onChange, max = 99, label = "Quantity" }: {
  value: number; onChange: (n: number) => void; max?: number; label?: string;
}) {
  return (
    <div className="inline-flex items-center overflow-hidden rounded-control border border-line-2 bg-card">
      <button type="button" aria-label="Reduce quantity" className="h-11 w-11 text-lg hover:bg-paper-2"
              onClick={() => onChange(Math.max(1, value - 1))} disabled={value <= 1}>−</button>
      <input className="w-12 bg-transparent text-center font-semibold" value={value} readOnly aria-label={label} />
      <button type="button" aria-label="Increase quantity" className="h-11 w-11 text-lg hover:bg-paper-2"
              onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max}>+</button>
    </div>
  );
}
