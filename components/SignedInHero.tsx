"use client";

import Link from "next/link";
import { Coins, Sparkles, Library } from "lucide-react";
import { useStore } from "@/lib/store";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default function SignedInHero() {
  const { ready, name } = useStore();
  const loaded = ready && !!name;
  const firstName = name.split(" ")[0];

  return (
    <section className="grain relative -mt-20 overflow-hidden bg-brand-900 pb-16 pt-32 text-white sm:pt-36">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-900 via-brand-800 to-brand-900" />
      <div className="absolute inset-0 bg-hero-mesh" />
      <div className="pointer-events-none absolute -left-32 top-0 h-[32rem] w-[32rem] rounded-full bg-brand-500/25 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-16 h-[26rem] w-[26rem] rounded-full bg-gold-400/15 blur-3xl" />

      <div className="relative mx-auto max-w-[96rem] px-4 sm:px-6">
        {/* greeting + actions */}
        <div className="animate-fade-up">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-gold-300">
            <Sparkles className="h-3.5 w-3.5" /> {greeting()}
          </p>
          <h1 className="display mt-3 text-4xl leading-[1] sm:text-5xl lg:text-6xl">
            Welcome back,
            <br />
            {loaded ? (
              <span className="text-gold-400">{firstName}</span>
            ) : (
              <span className="inline-block h-[0.85em] w-48 animate-pulse rounded-xl bg-white/15 align-middle" />
            )}{" "}
            👋
          </h1>
          <p className="mt-4 max-w-md text-lg text-brand-100">Ready for your next chapter?</p>

          <div className="mt-8 flex gap-3">
            <Link href="/library" className="btn-gold flex flex-1 items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold sm:flex-none">
              <Library className="h-4 w-4" /> Go to library
            </Link>
            <Link href="/coins" className="flex flex-1 items-center justify-center gap-2 rounded-full bg-white/10 px-6 py-3.5 text-sm font-semibold text-white ring-1 ring-white/25 transition hover:bg-white/15 sm:flex-none">
              <Coins className="h-4 w-4" /> Top up coins
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
