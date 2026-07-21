import Image from "next/image";
import Link from "next/link";
import { Play, Star, Sparkles, Coins, Globe, ArrowRight, SkipBack, SkipForward, Heart } from "lucide-react";
import type { Book } from "@/lib/types";

// Dark, modern hero that visually merges with the navbar above it. Bold editorial
// headline on the left, an animated app showcase on the right.
export default function LandingHero({ covers }: { covers: Book[] }) {
  const [c0, c1, c2] = covers;

  return (
    <section className="grain relative -mt-20 overflow-hidden bg-brand-900 pb-24 pt-32 text-white sm:pt-36">
      {/* depth + gradients + glows */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-900 via-brand-800 to-brand-900" />
      <div className="absolute inset-0 bg-hero-mesh" />
      <div className="pointer-events-none absolute -left-32 top-0 h-[32rem] w-[32rem] rounded-full bg-brand-500/25 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-16 h-[26rem] w-[26rem] rounded-full bg-gold-400/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-clay-200/15 blur-3xl" />

      <div className="relative mx-auto grid max-w-[96rem] items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-6">
        {/* LEFT — copy */}
        <div className="animate-fade-up text-center lg:text-left">
          

          <h1 className="display mt-5 text-5xl leading-[0.98] sm:text-6xl lg:text-7xl">
            Listen to the books you’ve been{" "}
            <span className="relative whitespace-nowrap text-gold-400">
              wanting
              <svg className="absolute -bottom-2 left-0 h-3 w-full text-gold-400/70" viewBox="0 0 200 12" preserveAspectRatio="none" fill="none">
                <path d="M2 8C40 3 160 3 198 8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </span>{" "}
            to read.
          </h1>

          

          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
            {/* Start listening free — with a floating "+50 free coins" popup */}
            <div className="relative w-full sm:w-auto">
              <span className="animate-float absolute -top-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 whitespace-nowrap rounded-full bg-gold-grad px-3 py-1 text-[11px] font-extrabold text-brand-900 shadow-gold">
                <Coins className="h-3.5 w-3.5" /> +50 free coins
                <span className="absolute -bottom-1 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rotate-45 rounded-[2px] bg-gold-400" />
              </span>
              <Link href="/signup" className="btn-gold flex w-full items-center justify-center gap-2 rounded-full px-7 py-4 text-base font-semibold sm:w-auto">
                <Play className="h-4 w-4 fill-current" /> Start listening free
              </Link>
            </div>
            <a href="#browse-categories" className="btn-sweep flex w-full items-center justify-center gap-2 rounded-full bg-white px-7 py-4 text-base font-semibold text-brand-700 shadow-soft hover:shadow-lg sm:w-auto">
              Explore your interest <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-brand-100 lg:justify-start">
            <span className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-gold-400" /> 120+ titles</span>
            <span className="flex items-center gap-2"><Globe className="h-4 w-4 text-gold-400" /> English &amp; Urdu</span>
          </div>
        </div>

        {/* RIGHT — phone app mockup */}
        <div className="relative mx-auto flex h-[30rem] w-full max-w-md items-center justify-center sm:h-[36rem]">
          {/* glows */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 animate-spin-slow rounded-full opacity-40 blur-2xl [background:conic-gradient(from_0deg,rgba(217,169,76,0.55),rgba(62,138,106,0.4),rgba(217,169,76,0.55))]" />
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-400/25 blur-3xl" />

          {/* phone */}
          {c0 && (
            <div className="relative w-60 rotate-[-4deg] rounded-[2.75rem] bg-gradient-to-b from-brand-950 to-black p-2.5 shadow-2xl ring-1 ring-white/15 transition-transform duration-500 hover:rotate-0 sm:w-72">
              <div className="relative overflow-hidden rounded-[2.25rem] bg-white p-4">
                {/* status notch */}
                <div className="mx-auto mb-4 h-1.5 w-16 rounded-full bg-gray-200" />

                {/* cover */}
                <div className="relative aspect-square w-full overflow-hidden rounded-2xl shadow-lg ring-1 ring-black/5">
                  <Image src={c0.cover_url} alt={c0.title} fill priority sizes="288px" className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <span className="absolute left-2.5 top-2.5 flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold text-brand-700 backdrop-blur">
                    <span className="relative flex h-1.5 w-1.5"><span className="live-dot absolute h-1.5 w-1.5 rounded-full bg-rose-500" /></span>
                    Now playing
                  </span>
                </div>

                {/* title */}
                <div className="mt-4 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-serif text-lg font-semibold text-gray-900">{c0.title}</p>
                    <p className="truncate text-xs text-gray-400">{c0.author_name}</p>
                  </div>
                  <Heart className="mt-1 h-5 w-5 shrink-0 fill-rose-500 text-rose-500" />
                </div>

                {/* progress */}
                <div className="mt-4">
                  <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                    <div className="animate-progress h-full rounded-full bg-gold-grad" />
                  </div>
                  <div className="mt-1.5 flex justify-between text-[10px] text-gray-400">
                    <span>4:20</span>
                    <span>12:00</span>
                  </div>
                </div>

                {/* controls */}
                <div className="mt-4 flex items-center justify-center gap-6 text-brand-700">
                  <SkipBack className="h-5 w-5 fill-current opacity-80" />
                  <span className="grid h-14 w-14 place-items-center rounded-full bg-gold-grad text-brand-900 shadow-gold">
                    <Play className="h-6 w-6 translate-x-0.5 fill-current" />
                  </span>
                  <SkipForward className="h-5 w-5 fill-current opacity-80" />
                </div>

                {/* equalizer footer */}
                <div className="mt-4 flex items-center justify-center gap-1.5 rounded-2xl bg-brand-50 py-2.5 ring-1 ring-brand-100">
                  <span className="flex items-end gap-0.5 text-brand-500">
                    {[0, 0.12, 0.24, 0.36, 0.48, 0.2].map((d, i) => (
                      <span key={i} className="eq-bar bg-current" style={{ animationDelay: `${d}s`, height: `${8 + ((i * 5) % 12)}px` }} />
                    ))}
                  </span>
                  <span className="ml-2 text-[11px] font-medium text-brand-700">1.5× speed</span>
                </div>
              </div>
            </div>
          )}

          {/* floating chips */}
          <div className="absolute right-2 top-8 flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-brand-700 shadow-card sm:right-0">
            <Star className="h-3.5 w-3.5 fill-gold-400 text-gold-400" /> 4.9
          </div>
          <div className="absolute -right-2 bottom-28 hidden items-center gap-2 rounded-2xl bg-white px-3 py-2 shadow-card sm:flex">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-brand text-white"><Globe className="h-4 w-4" /></span>
            <div>
              <p className="text-[11px] font-bold leading-none text-gray-900">English & Urdu</p>
              <p className="text-[10px] text-gray-400">120+ titles</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
