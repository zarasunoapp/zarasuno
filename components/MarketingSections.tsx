import Image from "next/image";
import Link from "next/link";
import { Leaf, ArrowRight, Library, Coins, Heart, Headphones } from "lucide-react";
import type { Book } from "@/lib/types";
import Curve from "./Curve";

const IMG = (id: string, w = 900) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

const FEATURES = [
  { label: "Handpicked summaries", desc: "Big ideas distilled into minutes.", img: "1481627834876-b7833e8f5570", kind: "img", span: "sm:col-span-2 sm:row-span-2", h: "h-64 sm:h-full" },
  { label: "A library in English & Urdu", desc: "Read in the language that feels like home — titles across every genre.", kind: "text-green" },
  { label: "Expert narrators", desc: "", img: "1505740420928-5e560c06d30e", kind: "img", h: "h-40" },
  { label: "Listen offline, anywhere", desc: "Download once, hear it on the metro, the gym, the drive.", kind: "text-cream" },
  { label: "New titles every week", desc: "", img: "1521587760476-6c12a4b040da", kind: "img", h: "h-40" },
  { label: "Free chapters to sample", desc: "The first chapter of every book is free — try before you unlock.", kind: "text-green" },
];

export default function MarketingSections({ featured }: { featured: Book[] }) {
  return (
    <>
      {/* FEATURED BOOKS — white band, covers only (first) */}
      <section className="relative bg-white py-14">
        <Curve fill="#ffffff" />
        <div className="mx-auto max-w-[96rem] px-4 sm:px-6">
          <div className="mb-8 flex items-center justify-center gap-3">
            <Headphones className="h-6 w-6 text-brand-500" />
            <h2 className="display text-3xl uppercase text-brand-700 sm:text-4xl">featured books</h2>
            <Headphones className="h-6 w-6 -scale-x-100 text-brand-500" />
          </div>

          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3">
            {featured.map((b) => (
              <Link
                key={b.id}
                href={`/book/${b.id}`}
                className="group relative aspect-square overflow-hidden rounded-3xl shadow-card ring-1 ring-black/5 transition-all hover:-translate-y-1.5 hover:shadow-cardHover"
              >
                <Image
                  src={b.cover_url}
                  alt={b.title}
                  fill
                  sizes="(max-width:640px) 45vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* WHY LISTENERS CHOOSE US — dark hero-style band */}
      <section id="why" className="grain relative bg-brand-900 py-16 text-white">
        <Curve fill="#052C24" />
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-900 via-brand-800 to-brand-900" />
          <div className="absolute inset-0 bg-hero-mesh" />
          <div className="pointer-events-none absolute -left-24 top-0 h-96 w-96 rounded-full bg-brand-500/20 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 rounded-full bg-gold-400/12 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-[96rem] px-4 sm:px-6">
          <div className="mb-8 text-center">
            <h2 className="display text-3xl uppercase text-white sm:text-4xl">why listeners choose us</h2>
            <Heart className="mx-auto mt-2 h-6 w-6 fill-gold-400 text-gold-400" />
          </div>

          <div className="grid auto-rows-[minmax(10rem,auto)] grid-cols-1 gap-4 sm:grid-cols-3">
            {FEATURES.map((f) =>
              f.kind === "img" ? (
                <div key={f.label} className={`group relative overflow-hidden rounded-3xl shadow-card ${f.span ?? ""} ${f.h ?? "h-40"}`}>
                  <Image src={IMG(f.img!)} alt={f.label} fill sizes="(max-width:640px) 100vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-900/85 via-brand-900/25 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <h3 className="font-serif text-lg font-semibold text-white">{f.label}</h3>
                    {f.desc && <p className="mt-0.5 text-sm text-brand-50">{f.desc}</p>}
                  </div>
                </div>
              ) : (
                <div key={f.label} className="flex flex-col justify-center rounded-3xl bg-white p-5 shadow-card">
                  <span className={`grid h-11 w-11 place-items-center rounded-2xl ${f.kind === "text-green" ? "bg-brand-50 text-brand-600" : "bg-gold-50 text-gold-600"}`}>
                    <Leaf className="h-5 w-5" />
                  </span>
                  <h3 className="mt-3 font-serif text-lg font-semibold text-gray-900">{f.label}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-gray-500">{f.desc}</p>
                </div>
              )
            )}
          </div>

          {/* CTAs — white buttons with a left→right green sweep on hover */}
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <a href="#app-home" className="btn-sweep group flex items-center justify-between rounded-2xl bg-white px-6 py-4 text-brand-700 shadow-lg ring-1 ring-white/20">
              <span className="flex items-center gap-3 font-semibold"><Library className="h-5 w-5" /> Browse the library</span>
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </a>
            <Link href="/coins" className="btn-sweep group flex items-center justify-between rounded-2xl bg-white px-6 py-4 text-brand-700 shadow-lg ring-1 ring-white/20">
              <span className="flex items-center gap-3 font-semibold"><Coins className="h-5 w-5 text-gold-500" /> See coin packs</span>
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
