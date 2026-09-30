import { api } from "@/lib/api";
import { Breadcrumb } from "@/components/Breadcrumb";
import { PackArt } from "@/components/PackArt";
import { WHY, PROCESS, TIMELINE } from "@/lib/content";
import Link from "next/link";

export const metadata = { title: "About us" };

export default async function AboutPage() {
  const oils = await api.oils();
  const heroOil = oils[0];

  return (
    <main>
      <div className="border-b border-line bg-paper-2 pb-9 pt-2">
        <div className="shell">
          <Breadcrumb items={[["Home", "/"], ["About us"]]} />
          <h1 className="text-display">A mill, not a marketing company</h1>
          <p className="mt-3.5 max-w-[60ch] text-ink-2">Eleven people, four machines and one shed on Gondal Road in Rajkot. Everything on this website was pressed there.</p>
        </div>
      </div>

      <section className="py-14">
        <div className="shell grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
          <div className="grid aspect-[4/3] place-items-center rounded-xl2 p-[10%]" style={{ background: "linear-gradient(150deg,#E9D9B7,#B9822F)" }}>
            {heroOil && <PackArt kind="TIN" color={heroOil.oilColor} label="Mill tin" />}
          </div>
          <div>
            <h2 className="text-h2">How we got here</h2>
            <p className="mt-4 text-ink-2">The mill was built on job work. Farmers brought their own groundnut, we pressed it, they paid per maund and took the cake home for cattle. The oil we sell today is still judged by those customers, who can tell a rushed batch from a rested one by smell alone.</p>
            <p className="mt-3.5 text-ink-2">We stayed small because the alternative was refining, and refining meant losing the part people came to us for. Instead we added pack sizes, a lab bench and, eventually, this website.</p>
          </div>
        </div>
      </section>

      <section className="bg-paper-2 py-14">
        <div className="shell">
          <h2 className="mb-8 text-h2">Thirty-four seasons</h2>
          <div>
            {TIMELINE.map(([y, t, d]) => (
              <div key={y} className="grid grid-cols-[70px_1fr] gap-5 border-b border-line py-5.5 sm:grid-cols-[86px_1fr]">
                <b className="font-display text-[1.3rem] text-gold-dark">{y}</b>
                <div><h3 className="text-[1.1rem]">{t}</h3><p className="mt-1.5 text-[0.95rem] text-ink-3">{d}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="shell">
          <h2 className="mb-8 text-h2">What we hold ourselves to</h2>
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

      <section className="bg-ink py-14 text-[#F6EEE2]">
        <div className="shell">
          <h2 className="text-h2 text-[#FFF3DE]">Inside the mill</h2>
          <p className="mt-2.5 max-w-[56ch] text-[#C3B4A0]">The same six steps run for every oil we press.</p>
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

      <section className="py-14 sm:py-24">
        <div className="shell">
          <div className="grid items-center gap-5.5 rounded-xl2 p-8.5 text-[#FBEFDC] sm:p-16 lg:grid-cols-[1.4fr_auto]"
               style={{ background: "linear-gradient(120deg,#2E231A,#4A3423 60%,#6A4517)" }}>
            <div><h2 className="text-h2 text-[#FFF3DE]">Come and see it press</h2>
              <p className="mt-3 max-w-[52ch] text-[#DCC7A8]">Weekdays, 10am to 5pm. Call a day ahead and someone will walk you through the floor, from the seed heap to the filling line.</p></div>
            <Link href="/contact" className="rounded-control bg-gold px-6 py-3 font-semibold text-[#2A1E07]">Plan a visit</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
