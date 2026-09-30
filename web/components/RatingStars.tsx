export function RatingStars({ rating, count, className = "" }: { rating: number; count?: number; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 ${className}`}
          aria-label={`${rating.toFixed(1)} out of 5${count !== undefined ? `, ${count} reviews` : ""}`}>
      <span className="inline-flex gap-[2px]" aria-hidden>
        {[1, 2, 3, 4, 5].map((i) => {
          const filled = rating >= i - 0.3;
          return (
            <svg key={i} viewBox="0 0 24 24" className="h-3.5 w-3.5"
                 fill={filled ? "#D79B1E" : "none"} stroke={filled ? "#D79B1E" : "#C9BCA6"} strokeWidth={1.8}>
              <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" />
            </svg>
          );
        })}
      </span>
      {count !== undefined && <span className="text-xs text-ink-3">{rating.toFixed(1)} ({count})</span>}
    </span>
  );
}
