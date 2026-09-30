"use client";
import { toast } from "./Toast";

export function NewsletterForm() {
  return (
    <form className="mt-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); e.currentTarget.reset(); toast("You are on the list", "ok"); }}>
      <input type="email" required placeholder="Your email" aria-label="Email for newsletter"
             className="min-w-0 flex-1 rounded-control border border-white/15 bg-white/10 px-4.5 py-3 text-white placeholder:text-[#9C8B78]" />
      <button type="submit" className="whitespace-nowrap rounded-control bg-gold px-4 py-2 text-sm font-semibold text-[#2A1E07]">Join</button>
    </form>
  );
}
