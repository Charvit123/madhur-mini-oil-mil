import Link from "next/link";
import { api } from "@/lib/api";
import { PackArt } from "@/components/PackArt";
import { ProductGrid } from "@/components/ProductGrid";
import { RatingStars } from "@/components/RatingStars";
import { FAQAccordion } from "@/components/FAQAccordion";
import { money } from "@/lib/format";
import { PROCESS, WHY, TESTIMONIALS, SITE_FAQ } from "@/lib/content";

export default async function HomePage() {
  const [oils, featured] = await Promise.all([api.oils(), api.featured(8)]);
  const heroOil = oils[0];

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden py-9 sm:py-12 lg:py-[74px]">
        <div className="shell grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-5">
          <div>
            <span className="inline-flex rounded-control bg-olive-tint px-3.5 py-1.5 text-sm font-semibold text-olive-dark">
              Pressing since 1992 · Rajkot
            </span>
            <h1 className="mt-4.5 text-display">
              The oil your<br />kitchen ran on<br /><em className="font-normal italic">before the labels</em>
            </h1>
            <p className="mt-5 max-w-[48ch] text-[1.06rem] text-ink-2">
              Madhur is a mini oil mill, not a brand office. We buy the seed, press it, filter it twice and send it out
              the same week, in pack sizes from a 500 ml bottle to a 15 kg tin.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/shop" className="rounded-control bg-gold px-6 py-3 font-semibold text-[#2A1E07]">Shop the oils</Link>
              <Link href="/about" className="rounded-control border border-line-2 px-6 py-3 font-semibold">See how we press</Link>
            </div>
            <div className="mt-9.5 flex flex-wrap gap-6.5 border-t border-line pt-6.5">
              <Fact big="34" small="years at the same mill" />
              <Fact big="3" small="oils, pressed in-house" />
              <Fact big="9" small="pack sizes" />
              <Fact big="4.8" small="average from 682 reviews" />
            </div>
          </div>
          <div className="relative grid min-h-[320px] place-items-center lg:min-h-[520px]">
            <div className="absolute aspect-square w-[min(90%,420px)] rounded-full"
                 style={{ background: "radial-gradient(circle at 50% 50%, rgba(215,155,30,.22), rgba(215,155,30,0) 62%)" }} />
            {heroOil && <PackArt kind="TIN" color={heroOil.oilColor} label={`${heroOil.name} tin`} className="relative w-[min(74%,330px)] drop-shadow-[0_30px_40px_rgba(66,44,12,0.32)]" />}
          </div>
        </div>
      </section>

      {/* Three oils */}
      <section className="bg-paper-2 py-14">
        <div className="shell">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-h2">Three oils, pressed to order</h2>
              <p className="mt-2.5 max-w-[56ch] text-ink-3">Each one comes in several pack sizes. Open an oil to see everything currently filling on the line.</p>
            </div>
            <Link href="/shop" className="rounded-control border border-line-2 px-4 py-2 text-sm font-semibold">All products</Link>
          </div>
          <div className="grid gap-4.5 sm:grid-cols-3">
            {oils.map((oil) => (
              <Link key={oil.id} href={`/shop/${oil.slug}`} className="flex flex-col overflow-hidden rounded-panel border border-line bg-card transition hover:shadow-card">
                <div className="grid aspect-[4/3] place-items-center p-5" style={{ background: `linear-gradient(160deg,#FFFDF8,${oil.oilColor}44)` }}>
                  <PackArt kind="TIN" color={oil.oilColor} label={oil.name} className="h-[78%] w-auto" />
                </div>
                <div className="flex flex-1 flex-col gap-2.5 p-6">
                  <h3 className="text-h3">{oil.name}</h3>
                  <p className="text-[0.93rem] text-ink-3">{oil.tagline}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {oil.packLabels.slice(0, 3).map((p) => <span key={p} className="rounded-control border border-line bg-paper-2 px-2.5 py-1 text-xs">{p}</span>)}
                    {oil.packLabels.length > 3 && <span className="rounded-control bg-ink px-2.5 py-1 text-xs text-[#F6EEE2]">+{oil.packLabels.length - 3} more</span>}
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    {oil.priceFrom && <b className="font-display">from {money(oil.priceFrom)}</b>}
                    <span className="text-sm font-semibold text-gold-dark">Open</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why choose us */}
      <section className="py-14">
        <div className="shell">
          <h2 className="mb-8 text-h2">Why families keep coming back</h2>
          <div className="grid gap-px overflow-hidden rounded-panel border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
            {WHY.map(([t, d]) => (
              <div key={t} className="flex min-h-[186px] flex-col gap-2.5 bg-card p-6.5">
                <span className="grid h-[42px] w-[42px] place-items-center rounded-xl bg-gold-tint text-gold-dark">
                  <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round"><path d="m4.5 12.5 4.5 4.5L19.5 6.5" /></svg>
                </span>
                <h3 className="text-[1.1rem]">{t}</h3>
                <p className="text-[0.92rem] text-ink-3">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Editorial: the mill */}
      <section className="bg-paper-2 py-14">
        <div className="shell grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl2" style={{ background: "linear-gradient(150deg,#EFE0BE,#C99A5B)" }}>
            <div className="absolute inset-0 grid place-items-center p-[12%]">
              {heroOil && <PackArt kind="BUCKET" color={heroOil.oilColor} label="Mill bucket" />}
            </div>
          </div>
          <div>
            <span className="inline-flex rounded-control bg-olive-tint px-3.5 py-1.5 text-sm font-semibold text-olive-dark">The mill</span>
            <h2 className="mt-4 text-h2">One shed, one family, thirty-four seasons</h2>
            <p className="mt-4.5 text-ink-2">Hasmukhbhai Kaneriya bought a single expeller in 1992 and pressed groundnut for neighbours who brought their own seed. The shed on Gondal Road still stands, with four machines in it now and eleven people on the floor.</p>
            <p className="mt-3.5 text-ink-2">We have not grown into a refinery and we are not trying to. The scale is small on purpose: it is the only way to press to order, date every pack and answer the phone when you call about a batch.</p>
            <blockquote className="mt-6 border-l-[3px] border-gold pl-5 font-display text-[clamp(1.2rem,2.4vw,1.6rem)] italic leading-snug">
              Sell what you would cook at home. Everything else follows.
            </blockquote>
            <p className="mt-2 text-sm text-ink-3">Hasmukhbhai Kaneriya, founder</p>
            <Link href="/about" className="mt-6.5 inline-block rounded-control border border-line-2 px-6 py-3 font-semibold">Read our story</Link>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="bg-ink py-14 text-[#F6EEE2]">
        <div className="shell">
          <h2 className="text-h2 text-[#FFF3DE]">From seed to sealed tin</h2>
          <p className="mt-2.5 max-w-[56ch] text-[#C3B4A0]">Six steps, all of them under our roof. Nothing is outsourced except the courier.</p>
          <div className="mt-8 grid gap-3.5 sm:grid-cols-3 lg:grid-cols-6 lg:gap-0">
            {PROCESS.map(([t, d], i) => (
              <div key={t} className={`px-4.5 py-3 ${i > 0 ? "lg:border-l lg:border-white/15" : ""}`}>
                <span className="font-display text-sm tracking-wide text-gold">Step {i + 1}</span>
                <h3 className="mt-2 text-[1.02rem]">{t}</h3>
                <p className="mt-1.5 text-[0.86rem] text-[#CDBFAC]">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section className="py-14">
        <div className="shell">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-h2">Filling on the line this week</h2>
              <p className="mt-2.5 text-ink-3">Live stock from the mill. Prices include GST.</p>
            </div>
            <Link href="/shop" className="rounded-control border border-line-2 px-4 py-2 text-sm font-semibold">See all</Link>
          </div>
          <ProductGrid variants={featured} />
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-paper-2 py-14">
        <div className="shell">
          <h2 className="mb-8 text-h2">What buyers tell us</h2>
          <div className="grid gap-4.5 sm:grid-cols-3">
            {TESTIMONIALS.map(([quote, name, role, initials]) => (
              <div key={name} className="flex flex-col gap-3.5 rounded-panel border border-line bg-card p-6.5">
                <RatingStars rating={5} />
                <p className="text-[0.98rem] text-ink-2">{quote}</p>
                <div className="mt-auto flex items-center gap-2.5">
                  <i className="grid h-[38px] w-[38px] place-items-center rounded-full bg-olive-tint text-[0.92rem] font-bold not-italic text-olive-dark">{initials}</i>
                  <span><b className="block text-[0.92rem]">{name}</b><span className="text-[0.78rem] text-ink-3">{role}</span></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-14">
        <div className="shell">
          <h2 className="mb-6 text-h2">Questions we get on the phone</h2>
          <FAQAccordion items={SITE_FAQ.map(([question, answer]) => ({ question, answer }))} />
        </div>
      </section>

      {/* CTA band */}
      <section className="pb-14 sm:pb-24">
        <div className="shell">
          <div className="grid items-center gap-5.5 overflow-hidden rounded-xl2 p-8.5 text-[#FBEFDC] sm:p-16 lg:grid-cols-[1.4fr_auto]"
               style={{ background: "linear-gradient(120deg,#2E231A,#4A3423 60%,#6A4517)" }}>
            <div>
              <h2 className="text-h2 text-[#FFF3DE]">Order a tin, taste the difference in one meal</h2>
              <p className="mt-3 max-w-[52ch] text-[#DCC7A8]">Delivered across India. Free in Gujarat above ₹1,499, and we will call before dispatch if you want a specific pressing date.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/shop" className="rounded-control bg-gold px-6 py-3 font-semibold text-[#2A1E07]">Shop now</Link>
              <Link href="/contact" className="rounded-control border border-white/35 px-6 py-3 font-semibold text-[#FBEFDC]">Call the mill</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function Fact({ big, small }: { big: string; small: string }) {
  return (
    <div>
      <b className="block font-display text-[1.65rem] leading-none">{big}</b>
      <span className="text-[0.84rem] text-ink-3">{small}</span>
    </div>
  );
}
