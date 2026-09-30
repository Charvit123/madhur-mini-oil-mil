export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => <div key={i} className="h-[300px] animate-pulse rounded-card bg-paper-2" />)}
    </div>
  );
}
export function TextSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-3.5 animate-pulse rounded bg-paper-2" style={{ width: `${90 - i * 12}%` }} />
      ))}
    </div>
  );
}
