"use client";
export function ErrorState({ title = "This page did not load", body, onRetry }: {
  title?: string; body?: string; onRetry?: () => void;
}) {
  return (
    <div className="rounded-card border border-[#E7C3BD] bg-[#FCEDEA] px-5 py-5 text-[#7E241A]">
      <b>{title}</b>
      <p className="mt-1.5 text-sm">
        {body ?? "The catalogue service did not respond. Reload the page, and if it keeps failing call the mill on +91 98250 00000 and we will take the order by phone."}
      </p>
      {onRetry && <button onClick={onRetry} className="mt-3 rounded-control border border-[#C68A80] px-4 py-2 text-sm font-semibold">Try again</button>}
    </div>
  );
}
