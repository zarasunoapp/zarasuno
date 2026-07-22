import Link from "next/link";
import { Play, Compass, Headphones, Coins, Sparkles } from "lucide-react";
import Curve from "./Curve";

const STEPS = [
  { icon: Compass, title: "Discover", text: "Find handpicked books and summaries in English and Urdu." },
  { icon: Headphones, title: "Listen first", text: "Hear a sample before you unlock." },
  { icon: Coins, title: "Unlock simply", text: "Use coins to access the books you want." },
  { icon: Sparkles, title: "Listen your way", text: "Listen wherever your day takes you." },
];

// "Why ZaraSuno?" — a 4-step journey. Horizontal on desktop, 2×2 on mobile.
export default function MarketingSections() {
  return (
    <section id="why" className="grain relative bg-brand-900 py-16 text-white">
      <Curve fill="#052C24" />
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-900 via-brand-800 to-brand-900" />
        <div className="absolute inset-0 bg-hero-mesh" />
        <div className="pointer-events-none absolute -left-24 top-0 h-96 w-96 rounded-full bg-brand-500/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 rounded-full bg-gold-400/12 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-[80rem] px-4 sm:px-6">
        <div className="mb-10 text-center">
          <h2 className="display text-3xl uppercase text-white sm:text-4xl">Why ZaraSuno?</h2>
          <p className="mt-2 text-brand-100">Discover books in a way that fits your life.</p>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {STEPS.map((s) => (
            <div
              key={s.title}
              className="group relative overflow-hidden rounded-3xl bg-white/[0.06] p-6 ring-1 ring-white/10 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1.5 hover:bg-white/[0.1] hover:ring-gold-400/40"
            >
              <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gold-400/10 blur-2xl transition-opacity group-hover:opacity-100 sm:opacity-0" />
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gold-grad text-brand-900 shadow-gold transition-transform group-hover:scale-105">
                <s.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-5 font-serif text-lg font-semibold text-white">{s.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-brand-100">{s.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Link href="/signup" className="btn-gold flex items-center gap-2 rounded-full px-8 py-4 text-base font-semibold">
            <Play className="h-4 w-4 fill-current" /> Start listening for free
          </Link>
        </div>
      </div>
    </section>
  );
}
