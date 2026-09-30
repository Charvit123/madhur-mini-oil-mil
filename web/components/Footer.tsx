import Link from "next/link";
import { LogoMark } from "./Logo";
import { NewsletterForm } from "./NewsletterForm";
import type { OilSummary } from "@/lib/types";

export function Footer({ oils }: { oils: OilSummary[] }) {
  return (
    <footer className="mt-0 bg-ink px-0 pb-6 pt-12 text-[#D9CBB8] sm:pt-16">
      <div className="shell grid gap-8 md:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1.4fr]">
        <div>
          <div className="mb-3.5 flex items-center gap-2.5">
            <LogoMark dark />
            <span className="flex flex-col leading-none">
              <span className="font-display text-[1.22rem] font-bold text-[#FFF3DE]">Madhur</span>
              <span className="text-[0.62rem] uppercase tracking-[0.22em] text-[#9C8B78]">Mini Oil Mill</span>
            </span>
          </div>
          <p className="max-w-[36ch] text-[0.93rem]">
            A family mill in Rajkot pressing groundnut, sesame and cottonseed oil since 1992. Filtered in small batches, packed the same week, sent straight to your kitchen.
          </p>
          <div className="mt-4.5 flex gap-2.5">
            <a href="/contact" aria-label="WhatsApp" className="grid h-10 w-10 place-items-center rounded-full border border-white/20">
              <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2zm5.2 14.1c-.2.6-1.2 1.2-1.7 1.2-.9.1-1 .7-4.2-.9s-4.3-4.6-4.4-4.8c-.1-.2-.8-1.2-.8-2.3s.6-1.6.8-1.8c.2-.2.4-.3.6-.3h.5c.2 0 .4-.1.7.5l.9 2.1c.1.2.1.4 0 .6l-.4.5c-.2.2-.3.4-.1.7.2.3.8 1.4 1.8 2.2 1.2 1.1 2.2 1.4 2.5 1.5.2.1.4 0 .6-.2l.7-.9c.2-.2.4-.2.6-.1l2 1c.3.1.5.2.5.4s0 .9-.2 1.4z" /></svg>
            </a>
            <a href="/contact" aria-label="Instagram" className="grid h-10 w-10 place-items-center rounded-full border border-white/20">
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><rect x={3.5} y={3.5} width={17} height={17} rx={5} /><circle cx={12} cy={12} r={3.8} /><circle cx={17} cy={7} r={1.2} fill="currentColor" /></svg>
            </a>
          </div>
        </div>

        <div>
          <h4 className="mb-3.5 text-sm font-bold text-[#FFF3DE]">Shop</h4>
          {oils.map((o) => <FootLink key={o.slug} href={`/shop/${o.slug}`}>{o.name}</FootLink>)}
          <FootLink href="/shop">All pack sizes</FootLink>
        </div>

        <div>
          <h4 className="mb-3.5 text-sm font-bold text-[#FFF3DE]">Company</h4>
          <FootLink href="/about">About us</FootLink>
          <FootLink href="/about">Our story</FootLink>
          <FootLink href="/contact">Contact</FootLink>
          <FootLink href="/shop">All products</FootLink>
          <FootLink href="/admin">Admin dashboard</FootLink>
        </div>

        <div>
          <h4 className="mb-3.5 text-sm font-bold text-[#FFF3DE]">Order help</h4>
          <p className="text-[0.93rem]">Mon–Sat, 9am to 7pm<br /><a href="tel:+919825000000" className="text-gold">+91 98250 00000</a><br />orders@madhuroil.in</p>
          <h4 className="mb-3.5 mt-5.5 text-sm font-bold text-[#FFF3DE]">Get the pressing calendar</h4>
          <NewsletterForm />
        </div>
      </div>

      <div className="shell mt-10 flex flex-wrap justify-between gap-x-5 gap-y-2 border-t border-white/10 pt-5 text-[0.84rem] text-[#9C8B78]">
        <span>© {new Date().getFullYear()} Madhur Mini Oil Mill, Rajkot, Gujarat. FSSAI 10012345678901.</span>
        <span><Link href="/legal">Privacy</Link> · <Link href="/legal">Terms</Link> · <Link href="/legal">Refunds</Link> · <Link href="/legal">Shipping</Link></span>
      </div>
    </footer>
  );
}

function FootLink({ href, children }: { href: string; children: React.ReactNode }) {
  return <Link href={href} className="block py-1 text-[0.93rem] hover:text-gold">{children}</Link>;
}

