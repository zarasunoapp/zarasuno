"use client";

import Link from "next/link";
import { Coins, Heart, BookOpen, Sparkles, ArrowRight } from "lucide-react";
import { useStore } from "@/lib/store";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default function WelcomeHeader() {
  const { ready, name, coins, favourites, unlocked } = useStore();
  if (!ready) return null;

  const firstName = (name || "there").split(" ")[0];

  const stats = [
    { icon: Coins, label: "Coins", value: coins, tint: "text-gold-300" },
    { icon: BookOpen, label: "Unlocked", value: unlocked.length, tint: "text-brand-200" },
    { icon: Heart, label: "Favourites", value: favourites.length, tint: "text-rose-300" },
  ];

  return (
    <div className="animate-fade-up mx-auto max-w-7xl px-4 sm:px-6">
      <div className="flex flex-col gap-6 rounded-3xl border border-brand-100/60 bg-white/70 p-6 shadow-soft backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:p-7">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-gold-500">
            <Sparkles className="h-3.5 w-3.5" /> {greeting()}
          </p>
          <h1 className="mt-1 font-serif text-3xl font-semibold text-gray-900 sm:text-4xl">
            Welcome back, {firstName} 👋
          </h1>
          <p className="mt-1 text-gray-500">Ready for your next chapter?</p>
        </div>

        <div className="flex items-center gap-3">
          {stats.map(({ icon: Icon, label, value, tint }) => (
            <div key={label} className="flex min-w-[5.5rem] flex-col items-center rounded-2xl bg-brand-900 px-4 py-3 text-center text-white shadow-soft">
              <Icon className={`h-5 w-5 ${tint}`} />
              <span className="mt-1 font-serif text-xl font-bold">{value}</span>
              <span className="text-[10px] uppercase tracking-wide text-brand-100">{label}</span>
            </div>
          ))}
          <Link
            href="/coins"
            className="hidden items-center gap-2 rounded-2xl bg-gold-400 px-5 py-3 text-sm font-semibold text-brand-900 shadow-soft transition hover:bg-gold-300 lg:flex"
          >
            Top up <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
