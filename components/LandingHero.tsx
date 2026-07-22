import Link from "next/link";
import { Play, Star, Sparkles, Coins, Globe, ArrowRight } from "lucide-react";
import type { Book } from "@/lib/types";
import type { HeroFeature } from "@/lib/queries";
import HeroPhone from "./HeroPhone";

// Dark, modern hero that visually merges with the navbar above it. Bold editorial
// headline on the left, an animated app showcase on the right.
export default function LandingHero({ covers, heroFeature }: { covers: Book[]; heroFeature?: HeroFeature | null }) {
  const [c0] = covers;
  // Prefer the admin-selected hero book (real book + 1-min sample); else fall
  // back to the newest cover with no audio.
  const phone = heroFeature
    ? { bookId: heroFeature.book_id, title: heroFeature.title, author: heroFeature.author_name, coverUrl: heroFeature.cover_url, sampleUrl: heroFeature.sample_audio_url, sampleLabel: heroFeature.sample_label }
    : c0
    ? { bookId: c0.id, title: c0.title, author: c0.author_name, coverUrl: c0.cover_url, sampleUrl: null, sampleLabel: "Now playing" }
    : null;

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
              <span className="animate-float absolute -top-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 whitespace-nowrap rounded-full bg-white px-3 py-1 text-[11px] font-extrabold text-brand-700 shadow-card ring-1 ring-black/5">
                <Coins className="h-3.5 w-3.5 text-gold-500" /> +50 free coins
                <span className="absolute -bottom-1 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rotate-45 rounded-[2px] bg-white" />
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

          {/* phone — real, admin-selected book with a playable 1-min sample */}
          {phone && (
            <HeroPhone
              bookId={phone.bookId}
              title={phone.title}
              author={phone.author}
              coverUrl={phone.coverUrl}
              sampleUrl={phone.sampleUrl}
              sampleLabel={phone.sampleLabel}
            />
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
