"use client";

import Link from "next/link";
import Image from "next/image";
import { Play, Coins, Heart, BookOpen, Sparkles, Library, ArrowRight } from "lucide-react";
import type { Book } from "@/lib/types";
import { useStore } from "@/lib/store";
import { formatDuration } from "@/lib/utils";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default function SignedInHero({ bookOfDay }: { bookOfDay: Book | null }) {
  const { name, coins, favourites, unlocked } = useStore();
  const firstName = (name || "there").split(" ")[0];

  const stats = [
    { icon: Coins, label: "Coins", value: coins, tint: "text-gold-300" },
    { icon: BookOpen, label: "Unlocked", value: unlocked.length, tint: "text-brand-200" },
    { icon: Heart, label: "Favourites", value: favourites.length, tint: "text-rose-300" },
  ];

  return (
    <section className="grain relative -mt-20 overflow-hidden bg-brand-900 pb-16 pt-32 text-white sm:pt-36">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-900 via-brand-800 to-brand-900" />
      <div className="absolute inset-0 bg-hero-mesh" />
      <div className="pointer-events-none absolute -left-32 top-0 h-[32rem] w-[32rem] rounded-full bg-brand-500/25 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-16 h-[26rem] w-[26rem] rounded-full bg-gold-400/15 blur-3xl" />

      <div className="relative mx-auto grid max-w-[88rem] items-center gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_1.05fr]">
        {/* LEFT — greeting + stats */}
        <div className="animate-fade-up">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-gold-300">
            <Sparkles className="h-3.5 w-3.5" /> {greeting()}
          </p>
          <h1 className="display mt-3 text-4xl leading-[1] sm:text-5xl lg:text-6xl">
            Welcome back,
            <br />
            <span className="text-gold-400">{firstName}</span> 👋
          </h1>
          <p className="mt-4 max-w-md text-lg text-brand-100">Ready for your next chapter?</p>

          {/* stat chips */}
          <div className="mt-7 flex flex-wrap gap-3">
            {stats.map(({ icon: Icon, label, value, tint }) => (
              <div key={label} className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/15 backdrop-blur">
                <Icon className={`h-5 w-5 ${tint}`} />
                <div>
                  <p className="font-serif text-lg font-bold leading-none">{value}</p>
                  <p className="text-[10px] uppercase tracking-wide text-brand-100">{label}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/library" className="btn-gold flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold">
              <Library className="h-4 w-4" /> Continue in library
            </Link>
            <Link href="/coins" className="flex items-center gap-2 rounded-full bg-white/10 px-6 py-3.5 text-sm font-semibold text-white ring-1 ring-white/25 transition hover:bg-white/15">
              <Coins className="h-4 w-4" /> Top up coins
            </Link>
          </div>
        </div>

        {/* RIGHT — Book of the Day card */}
        {bookOfDay && (
          <div className="animate-fade-up" style={{ animationDelay: "120ms" }}>
            <div className="relative overflow-hidden rounded-[1.75rem] bg-cream p-5 text-gray-900 shadow-2xl ring-1 ring-white/10 sm:p-6">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-400 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-brand-900">
                <Sparkles className="h-3 w-3" /> Book of the Day
              </span>
              <div className="mt-4 flex gap-5">
                <Link href={`/book/${bookOfDay.id}`} className="animate-float relative aspect-square w-28 shrink-0 overflow-hidden rounded-2xl shadow-xl ring-1 ring-black/5 sm:w-36">
                  <Image src={bookOfDay.cover_url} alt={bookOfDay.title} fill sizes="150px" className="object-cover" />
                </Link>
                <div className="min-w-0 flex-1">
                  <h2 className="font-serif text-2xl font-semibold text-brand-800">{bookOfDay.title}</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    {bookOfDay.author_name} · {formatDuration(bookOfDay.duration_seconds)} · {bookOfDay.chapter_count} ch
                  </p>
                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-gray-600">{bookOfDay.description}</p>
                </div>
              </div>
              <div className="mt-5 flex items-center gap-3">
                <Link href={`/book/${bookOfDay.id}`} className="btn-green flex flex-1 items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold">
                  <Play className="h-4 w-4 fill-current" /> Start listening
                </Link>
                <Link href={`/book/${bookOfDay.id}`} className="grid h-11 w-11 place-items-center rounded-full bg-brand-50 text-brand-700 transition hover:bg-brand-100">
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
