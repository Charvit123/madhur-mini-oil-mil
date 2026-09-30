import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { PackArt, SeedArt } from "@/components/PackArt";
import { ProductGrid } from "@/components/ProductGrid";
import { FAQAccordion } from "@/components/FAQAccordion";
import { Breadcrumb } from "@/components/Breadcrumb";
import { PROCESS, SITE_FAQ } from "@/lib/content";

type Params = { params: Promise<{ oilSlug: string }> };

export async function generateStaticParams() {
  const oils = await api.oils();
  return oils.map((o) => ({ oilSlug: o.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { oilSlug } = await params;
  try {
    const oil = await api.oil(oilSlug);
    return { title: oil.name, description: oil.tagline };
  } catch { return { title: "Oil" }; }
}

export default async function OilCategoryPage({ params }: Params) {
  const { oilSlug } = await params;

  let oil, allOils;
  try {
    [oil, allOils] = await Promise.all([api.oil(oilSlug), api.oils()]);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }
  if (!oil) notFound();

  const others = allOils.filter((o) => o.slug !== oil.slug);

  return (
    <main>
      <header className="border-b border-line pb-10 pt-2" style={{ background: `linear-gradient(160deg,var(--paper-2),${oil.oilColor}33)` }}>
        <div className="shell">
          <Breadcrumb items={[["Home", "/"], ["Shop", "/shop"], [oil.name]]} />
          <div className="grid items-center gap-8 lg:grid-cols-2">
            <div>
              <h1 className="text-display">{oil.name}</h1>
              <p className="mt-4 text-[1.05rem] text-ink-2">{oil.description}</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <a href="#packs" className="rounded-control bg-gold px-6 py-3 font-semibold text-[#2A1E07]">See {oil.variants.length} pack sizes</a>
                {!!oil.variants.length && (
                  <span className="rounded-control border border-line-2 px-6 py-3 font-semibold">
                    from {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Math.min(...oil.variants.map((v) => v.price)))}
                  </span>
                )}
              </div>
            </div>
            <div className="grid grid-cols-[1.4fr_1fr] items-stretch gap-3.5">
              <div className="grid aspect-[3/4] place-items-center rounded-xl2 p-[12%]" style={{ background: `linear-gradient(160deg,#FFFDF6,${oil.oilColor}66)` }}>
                {oil.variants[0] && <PackArt kind={oil.variants[0].packaging.kind} color={oil.oilColor} label={oil.name} />}
              </div>
              <div className="grid gap-3.5">
                <div className="grid aspect-square place-items-center rounded-xl2 p-[14%]" style={{ background: `${oil.oilColor}22` }}>
                  {oil.seedColor && <SeedArt oilColor={oil.oilColor} seedColor={oil.seedColor} />}
                </div>
                <div className="grid aspect-square place-items-center rounded-xl2 p-[12%]" style={{ background: `linear-gradient(160deg,${oil.oilColor},#241B14)` }}>
                  <PackArt kind="BOTTLE" color={oil.oilColor} label={`${oil.name} bottle`} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section id="packs" className="py-14">
        <div className="shell">
          <h2 className="text-h2">Available in {oil.variants.length} packs</h2>
          <p className="mb-8 mt-2.5 text-ink-3">Same oil, same batch. Pick the size that matches how fast your kitchen uses it.</p>
          <ProductGrid variants={oil.variants} />
        </div>
      </section>

      <section className="bg-paper-2 py-14">
        <div className="shell grid gap-8 lg:grid-cols-2 lg:gap-14">
          <div>
            <h2 className="text-h2">What makes our {oil.name.toLowerCase()} different</h2>
            <ul className="mt-6 space-y-3">
              {oil.features.map((f) => <li key={f} className="flex gap-3 text-ink-2"><span aria-hidden className="mt-1 text-olive">✓</span>{f}</li>)}
            </ul>
          </div>
          <div className="grid gap-3.5 sm:grid-cols-2">
            {oil.benefits.map((b) => (
              <div key={b.title} className="rounded-panel border border-line bg-card p-5">
                <h3 className="font-display text-lg">{b.title}</h3>
                <p className="mt-1.5 text-[0.93rem] text-ink-3">{b.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ink py-14 text-[#F6EEE2]">
        <div className="shell">
          <h2 className="text-h2 text-[#FFF3DE]">How this oil is made</h2>
          <div className="mt-8 grid gap-3.5 sm:grid-cols-3 lg:grid-cols-6 lg:gap-0">
            {PROCESS.map(([t, d], i) => (
              <div key={t} className={`px-4.5 py-3 ${i > 0 ? "lg:border-l lg:border-white/15" : ""}`}>
                <span className="font-display text-sm text-gold">Step {i + 1}</span>
                <h3 className="mt-2 text-[1.02rem]">{t}</h3>
                <p className="mt-1.5 text-[0.86rem] text-[#CDBFAC]">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {!!oil.faqs.length && (
        <section className="py-14">
          <div className="shell">
            <h2 className="mb-6 text-h2">About {oil.name.toLowerCase()}</h2>
            <FAQAccordion items={[...oil.faqs, ...SITE_FAQ.slice(0, 2).map(([question, answer]) => ({ question, answer }))]} />
          </div>
        </section>
      )}

      {!!others.length && (
        <section className="bg-paper-2 py-14">
          <div className="shell">
            <h2 className="mb-8 text-h2">Our other oils</h2>
            <div className="grid max-w-[760px] gap-4 sm:grid-cols-2">
              {others.map((o) => (
                <Link key={o.slug} href={`/shop/${o.slug}`} className="flex flex-col overflow-hidden rounded-panel border border-line bg-card">
                  <div className="grid aspect-[4/3] place-items-center p-5" style={{ background: `linear-gradient(160deg,#FFFDF8,${o.oilColor}44)` }}>
                    <PackArt kind="TIN" color={o.oilColor} label={o.name} className="h-[78%] w-auto" />
                  </div>
                  <div className="p-5">
                    <h3 className="text-[1.15rem] font-semibold">{o.name}</h3>
                    <p className="mt-1 text-[0.9rem] text-ink-3">{o.tagline}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
