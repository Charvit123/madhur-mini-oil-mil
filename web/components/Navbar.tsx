"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LogoMark, Wordmark } from "./Logo";
import { useCart } from "@/store/cart";
import { NAV_ITEMS } from "@/lib/content";
import { slideIn, scrim } from "@/lib/motion";
import type { OilSummary } from "@/lib/types";

/**
 * Ported from the prototype's .nav / .topbar / .searchbar / mobile .drawer-l:
 * a two-tier header (announcement bar + sticky nav) that compacts on scroll,
 * a search bar that expands under the nav, and a full-height mobile drawer.
 */
export function Navbar({ oils }: { oils: OilSummary[] }) {
  const pathname = usePathname();
  const router = useRouter();
  const count = useCart((s) => s.lines.reduce((n, l) => n + l.qty, 0));
  const openCart = useCart((s) => s.open);

  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [q, setQ] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); setSearchOpen(false); }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = ""; document.removeEventListener("keydown", onKey); };
  }, [menuOpen]);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchOpen(false);
    router.push(`/shop?q=${encodeURIComponent(q)}`);
  };

  return (
    <>
      <div className="flex flex-wrap justify-center gap-7 bg-ink px-4 py-2 text-[0.8rem] tracking-wide text-[#EFE2CE]">
        <span>Cold-filtered at our own mill in Rajkot</span>
        <span>Free delivery in Gujarat over <b className="text-gold">₹1,499</b></span>
      </div>

      <header className={`sticky top-0 z-[60] border-b transition-all duration-200
        ${scrolled ? "border-line shadow-[0_10px_30px_-24px_rgba(58,42,24,0.7)]" : "border-transparent"}
        bg-paper/90 backdrop-blur-md`}>
        <div className={`shell flex items-center gap-4 transition-all duration-200 ${scrolled ? "h-[60px]" : "h-[74px]"}`}>
          <Link href="/" className="mr-auto flex flex-shrink-0 items-center gap-2.5" aria-label="Madhur Mini Oil Mill, home">
            <LogoMark size={scrolled ? 34 : 40} />
            <Wordmark />
          </Link>

          <nav className="hidden gap-1 lg:flex" aria-label="Main">
            {NAV_ITEMS.slice(0, 2).map(([label, href]) => <NavLink key={href} href={href} label={label} pathname={pathname} />)}
            {oils[0] && <NavLink href={`/shop/${oils[0].slug}`} label="Oils" pathname={pathname} />}
            {NAV_ITEMS.slice(2).map(([label, href]) => <NavLink key={href} href={href} label={label} pathname={pathname} />)}
          </nav>

          <div className="flex items-center gap-1">
            <button onClick={() => setSearchOpen((s) => !s)} aria-label="Search products" className="grid h-[42px] w-[42px] place-items-center rounded-full hover:bg-card hover:border hover:border-line">
              <svg width={21} height={21} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><circle cx={11} cy={11} r={7} /><path d="m20 20-3.5-3.5" strokeLinecap="round" /></svg>
            </button>
            <Link href="/account" aria-label="Your account" className="grid h-[42px] w-[42px] place-items-center rounded-full hover:bg-card hover:border hover:border-line">
              <svg width={21} height={21} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><circle cx={12} cy={8.5} r={3.6} /><path d="M4.8 20c1.4-3.7 4-5.5 7.2-5.5s5.8 1.8 7.2 5.5" strokeLinecap="round" /></svg>
            </Link>
            <button onClick={openCart} aria-label="Open cart" className="relative grid h-[42px] w-[42px] place-items-center rounded-full hover:bg-card hover:border hover:border-line">
              <svg width={21} height={21} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M4 6h2.2l2 10.2h9.4L20 8.6H7" strokeLinecap="round" strokeLinejoin="round" /><circle cx={9.5} cy={20} r={1.4} fill="currentColor" stroke="none" /><circle cx={17} cy={20} r={1.4} fill="currentColor" stroke="none" /></svg>
              {count > 0 && <span className="absolute right-0.5 top-0.5 grid h-[19px] min-w-[19px] place-items-center rounded-full bg-kiln px-1 text-[0.68rem] font-bold text-white">{count}</span>}
            </button>
            <button onClick={() => setMenuOpen(true)} aria-label="Open menu" aria-expanded={menuOpen} className="grid h-[42px] w-[42px] place-items-center rounded-full hover:bg-card hover:border hover:border-line lg:hidden">
              <svg width={22} height={22} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h11" /></svg>
            </button>
          </div>
        </div>

        {searchOpen && (
          <div className="border-t border-line bg-paper">
            <div className="shell">
              <form onSubmit={submitSearch} className="flex gap-2.5 py-3.5" role="search">
                <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} type="search"
                       placeholder="Search oils, pack sizes or SKUs" aria-label="Search"
                       className="flex-1 rounded-control border border-line-2 bg-white px-4.5 py-3" />
                <button type="submit" className="rounded-control bg-ink px-6 py-3 font-semibold text-[#FFF6E6]">Search</button>
              </form>
            </div>
          </div>
        )}
      </header>

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div variants={scrim} initial="hidden" animate="show" exit="exit" onClick={() => setMenuOpen(false)} className="fixed inset-0 z-[70] bg-ink/50" />
            <motion.aside variants={slideIn("left")} initial="hidden" animate="show" exit="exit"
              role="dialog" aria-modal="true" aria-label="Menu" className="fixed inset-y-0 left-0 z-[80] flex w-[min(420px,88vw)] flex-col bg-paper">
              <div className="flex items-center justify-between border-b border-line px-5 py-4">
                <h3 className="text-h3">Menu</h3>
                <button onClick={() => setMenuOpen(false)} aria-label="Close menu" className="h-10 w-10 rounded-full hover:bg-card">✕</button>
              </div>
              <div className="flex-1 overflow-y-auto px-5">
                {NAV_ITEMS.map(([label, href]) => (
                  <Link key={href} href={href} className="flex items-center justify-between border-b border-line py-4 text-[1.08rem] font-medium">
                    {label}<span>›</span>
                  </Link>
                ))}
                <div className="mt-5 text-xs tracking-[0.14em] text-ink-3">OUR OILS</div>
                {oils.map((o) => (
                  <Link key={o.slug} href={`/shop/${o.slug}`} className="flex items-center justify-between border-b border-line py-4 text-[1.08rem] font-medium">
                    {o.name}<span>›</span>
                  </Link>
                ))}
                <Link href="/admin" className="flex items-center justify-between border-b border-line py-4 text-[1.08rem] font-medium">
                  Admin dashboard<span>›</span>
                </Link>
              </div>
              <div className="border-t border-line bg-card px-5 py-4">
                <Link href="/shop" className="block rounded-control bg-gold py-3 text-center font-semibold text-[#2A1E07]">Shop all oils</Link>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function NavLink({ href, label, pathname }: { href: string; label: string; pathname: string }) {
  const active = pathname === href;
  return (
    <Link href={href} className={`relative rounded-control px-3.5 py-2 text-[0.95rem] font-medium transition
      ${active ? "text-ink" : "text-ink-2 hover:bg-gold-tint hover:text-ink"}`}>
      {label}
      {active && <span className="absolute inset-x-3.5 bottom-0.5 h-0.5 rounded-full bg-gold" />}
    </Link>
  );
}
