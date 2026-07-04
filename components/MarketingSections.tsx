"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Leaf, Star, ArrowRight, Library, Coins, Heart, ChevronDown, Headphones, HelpCircle,
} from "lucide-react";
import type { Book } from "@/lib/types";
import type { Faq } from "@/lib/queries";
import Curve from "./Curve";
import TornCard from "./TornCard";

const IMG = (id: string, w = 900) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

const FEATURES = [
  { label: "Handpicked summaries", desc: "Big ideas distilled into minutes.", img: "1481627834876-b7833e8f5570", kind: "img", span: "sm:col-span-2 sm:row-span-2", h: "h-64 sm:h-full" },
  { label: "A library in English & Urdu", desc: "Read in the language that feels like home — titles across every genre.", kind: "text-green" },
  { label: "Expert narrators", desc: "", img: "1505740420928-5e560c06d30e", kind: "img", h: "h-40" },
  { label: "Listen offline, anywhere", desc: "Download once, hear it on the metro, the gym, the drive.", kind: "text-cream" },
  { label: "New titles every week", desc: "", img: "1521587760476-6c12a4b040da", kind: "img", h: "h-40" },
  { label: "Free chapters to sample", desc: "The first chapter of every book is free — try before you unlock.", kind: "text-green" },
];

const REVIEWS = [
  { name: "Ayesha Khan", date: "14 August", text: "Professional, warm and beautifully made. I finish a whole book on my commute now — and the Urdu narrations feel like home. It's become part of my daily ritual.", img: "1544947950-fa07a98d237f" },
  { name: "Bilal Raza", date: "2 September", text: "The summaries are gold. I read three times more since joining, and unlocking with coins couldn't be simpler. Gorgeous, calm design too.", img: "1495446815901-a7297e633e8d" },
];

const FAQS = [
  { q: "Do I need a subscription?", a: "No. Buy coins once and unlock only the books you love — no recurring fees, ever." },
  { q: "Which languages are available?", a: "English and Urdu today, with Hindi and more on the way." },
  { q: "Can I listen offline?", a: "Yes — once a book is unlocked you can download its chapters and listen anywhere." },
  { q: "How do free previews work?", a: "The first chapter of every book is a free preview, playable even before you unlock it." },
  { q: "Do coins ever expire?", a: "Never. Your coins and unlocked books stay with your account for good." },
];

export default function MarketingSections({ featured, faqs }: { featured: Book[]; faqs?: Faq[] }) {
  const faqItems = faqs && faqs.length ? faqs.map((f) => ({ q: f.question, a: f.answer })) : FAQS;
  return (
    <>
      {/* WHY LISTENERS CHOOSE US — near white */}
      <section id="why" className="relative bg-ivory py-14">
        <Curve fill="#F7F3EA" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-8 text-center">
            <h2 className="display text-3xl uppercase text-brand-700 sm:text-4xl">why listeners choose us</h2>
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
                <div key={f.label} className="flex flex-col justify-center rounded-3xl bg-white p-5 shadow-card ring-1 ring-black/5">
                  <span className={`grid h-11 w-11 place-items-center rounded-2xl ${f.kind === "text-green" ? "bg-brand-50 text-brand-600" : "bg-gold-50 text-gold-600"}`}>
                    <Leaf className="h-5 w-5" />
                  </span>
                  <h3 className="mt-3 font-serif text-lg font-semibold text-gray-900">{f.label}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-gray-500">{f.desc}</p>
                </div>
              )
            )}
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <a href="#app-home" className="group flex items-center justify-between rounded-2xl bg-brand px-6 py-4 text-white shadow-soft transition hover:bg-brand-600">
              <span className="flex items-center gap-3 font-semibold"><Library className="h-5 w-5" /> Browse the library</span>
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </a>
            <Link href="/coins" className="group flex items-center justify-between rounded-2xl bg-gold-400 px-6 py-4 text-brand-800 shadow-soft transition hover:bg-gold-300">
              <span className="flex items-center gap-3 font-semibold"><Coins className="h-5 w-5" /> See coin packs</span>
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* BOOKS & PRICES — green band */}
      <section className="relative sage py-14">
        <Curve fill="#CADFCE" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-8 flex items-center justify-center gap-3">
            <Headphones className="h-6 w-6 text-brand-500" />
            <h2 className="display text-3xl uppercase text-brand-700 sm:text-4xl">books &amp; prices</h2>
            <Headphones className="h-6 w-6 -scale-x-100 text-brand-500" />
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {featured.map((b) => (
              <article key={b.id} className="flex flex-col overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-brand-100/60">
                <Link href={`/book/${b.id}`} className="relative block aspect-[16/10] overflow-hidden">
                  <Image src={b.cover_url} alt={b.title} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover transition-transform duration-500 hover:scale-105" />
                </Link>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-serif text-lg font-semibold text-gray-900">{b.title}</h3>
                  <p className="mt-1 line-clamp-2 flex-1 text-sm leading-relaxed text-gray-500">
                    {b.subtitle ? `${b.subtitle}. ` : ""}{b.author_name}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <Link href={`/book/${b.id}`} className="group flex items-center gap-2 rounded-full bg-brand-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-black">
                      Details <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                    <span className="flex items-center gap-1 text-sm font-bold text-brand-700">
                      {b.is_free ? "Free" : <><Coins className="h-4 w-4 text-gold-500" /> from {b.coin_price}</>}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS — torn-paper cards on a photographic green band */}
      <section className="relative bg-brand-900 py-16 text-white">
        <Curve fill="#052C24" />
        {/* image is clipped by an inner wrapper so the curve above is never cut off */}
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src={IMG("1507842217343-583bb7270b66", 1600)}
            alt=""
            fill
            sizes="100vw"
            className="object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#052C24] via-brand-900/70 to-brand-900" />
        </div>
        <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="display text-center text-3xl uppercase sm:text-4xl">what listeners say about us</h2>
          <div className="mt-12 grid gap-10 md:grid-cols-2">
            {REVIEWS.map((r) => (
              <TornCard key={r.name} className="mx-auto w-full max-w-md">
                <div className="px-8 pb-8 pt-10 text-center">
                  <h3 className="font-serif text-xl font-semibold text-brand-800">{r.name}</h3>
                  <div className="mt-2 flex items-center justify-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-gold-400 text-gold-400" />
                    ))}
                    <span className="ml-2 text-xs text-gray-400">{r.date}</span>
                  </div>
                  <p className="mt-4 text-sm italic leading-relaxed text-gray-600">&ldquo;{r.text}&rdquo;</p>
                  <div className="relative mx-auto mt-6 aspect-[16/10] w-full overflow-hidden rounded-xl shadow-lg">
                    <Image src={IMG(r.img, 800)} alt="Beautiful books" fill sizes="420px" className="object-cover" />
                  </div>
                </div>
              </TornCard>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ — near white */}
      <section className="relative bg-ivory py-14">
        <Curve fill="#F7F3EA" />
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <div className="mb-8 text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold text-brand-700 shadow-soft ring-1 ring-brand-100">
              <HelpCircle className="h-3.5 w-3.5 text-gold-500" /> Got questions?
            </span>
            <h2 className="display mt-3 text-3xl uppercase text-brand-700 sm:text-4xl">frequently asked</h2>
          </div>
          <div className="space-y-3">
            {faqItems.map((f, i) => <FaqItem key={i} {...f} />)}
          </div>
        </div>
      </section>
    </>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={`overflow-hidden rounded-2xl border transition-all duration-300 ${
        open ? "border-brand-100 bg-white shadow-card" : "border-transparent bg-white/60 hover:bg-white"
      }`}
    >
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left">
        <span className="font-semibold text-brand-800">{q}</span>
        <span
          className={`grid h-8 w-8 shrink-0 place-items-center rounded-full transition-all duration-300 ${
            open ? "rotate-180 bg-green-grad text-white shadow-btn" : "bg-brand-50 text-brand-600"
          }`}
        >
          <ChevronDown className="h-4 w-4" />
        </span>
      </button>
      {/* smooth height transition via grid-rows */}
      <div
        className="grid transition-all duration-300 ease-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <p className="px-5 pb-5 text-sm leading-relaxed text-gray-600">{a}</p>
        </div>
      </div>
    </div>
  );
}
