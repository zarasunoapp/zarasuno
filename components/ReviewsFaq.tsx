"use client";

import { useState } from "react";
import { Star, Quote, ChevronDown, HelpCircle } from "lucide-react";
import type { Faq, Testimonial } from "@/lib/queries";
import Curve from "./Curve";

type Review = { name: string; role: string; text: string; rating: number; avatar: string | null };

const FALLBACK_REVIEWS: Review[] = [
  { name: "Ayesha Khan", role: "Karachi", text: "I finish a whole book on my commute now — and the Urdu narrations feel like home. It's part of my daily ritual.", rating: 5, avatar: null },
  { name: "Bilal Raza", role: "Lahore", text: "The summaries are gold. I read three times more since joining, and unlocking with coins couldn't be simpler.", rating: 5, avatar: null },
  { name: "Hina Siddiqui", role: "Islamabad", text: "Gorgeous, calm design and excellent narrators. The free preview chapters sold me instantly.", rating: 5, avatar: null },
  { name: "Omar Farooq", role: "Sydney", text: "Perfect for busy days — big ideas in minutes, and no subscription nonsense. Exactly what I wanted.", rating: 5, avatar: null },
  { name: "Zara Malik", role: "Dubai", text: "The English & Urdu library is unmatched. My whole family listens now, from my kids to my mother.", rating: 5, avatar: null },
  { name: "Daniyal Ahmed", role: "London", text: "Clean, fast, and the audio quality is superb. Honestly worth every single coin I've spent.", rating: 5, avatar: null },
];

const DEFAULT_FAQS = [
  { q: "Do I need a subscription?", a: "No. Buy coins once and unlock only the books you love — no recurring fees, ever." },
  { q: "Which languages are available?", a: "English and Urdu today, with Hindi and more on the way." },
  { q: "Can I listen offline?", a: "Yes — once a book is unlocked you can download its chapters and listen anywhere." },
  { q: "How do free previews work?", a: "The first chapter of every book is a free preview, playable even before you unlock it." },
  { q: "Do coins ever expire?", a: "Never. Your coins and unlocked books stay with your account for good." },
];

export default function ReviewsFaq({ faqs, testimonials }: { faqs?: Faq[]; testimonials?: Testimonial[] }) {
  const faqItems = faqs && faqs.length ? faqs.map((f) => ({ q: f.question, a: f.answer })) : DEFAULT_FAQS;
  const reviews: Review[] =
    testimonials && testimonials.length
      ? testimonials.map((t) => ({ name: t.name, role: t.title ?? "", text: t.message, rating: t.rating || 5, avatar: t.avatar_url }))
      : FALLBACK_REVIEWS;
  // duplicate so the marquee can loop seamlessly (and never looks empty with 1–2)
  const loop = reviews.length >= 3 ? [...reviews, ...reviews] : [...reviews, ...reviews, ...reviews, ...reviews];

  return (
    <>
      {/* REVIEWS — full-width continuous marquee (pause on hover) */}
      <section className="relative bg-brand-900 py-16 text-white">
        <Curve fill="#052C24" />
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-900 via-brand-800 to-brand-900" />
          <div className="absolute inset-0 bg-hero-mesh" />
        </div>

        <div className="relative z-10">
          <h2 className="display mb-10 text-center text-3xl uppercase sm:text-4xl">what listeners say about us</h2>

          {/* marquee row — full screen width */}
          <div className="group relative w-full overflow-hidden">
            <div className="flex w-max gap-5 pl-5 animate-marquee group-hover:[animation-play-state:paused]">
              {loop.map((r, i) => (
                <figure
                  key={i}
                  className="w-[22rem] shrink-0 rounded-3xl bg-white p-7 text-left shadow-xl transition-transform duration-300 hover:-translate-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <Quote className="h-8 w-8 text-gold-400" />
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, s) => (
                        <Star key={s} className={s < r.rating ? "h-4 w-4 fill-gold-400 text-gold-400" : "h-4 w-4 text-gray-200"} />
                      ))}
                    </div>
                  </div>
                  <blockquote className="mt-4 text-[15px] leading-relaxed text-gray-700">&ldquo;{r.text}&rdquo;</blockquote>
                  <figcaption className="mt-5 flex items-center gap-3 border-t border-gray-100 pt-4">
                    {r.avatar ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={r.avatar} alt={r.name} className="h-10 w-10 rounded-full object-cover" />
                    ) : (
                      <span className="grid h-10 w-10 place-items-center rounded-full bg-brand text-sm font-bold text-white">
                        {r.name.charAt(0)}
                      </span>
                    )}
                    <span>
                      <span className="block font-serif font-semibold text-brand-800">{r.name}</span>
                      {r.role && <span className="block text-xs text-gray-400">{r.role}</span>}
                    </span>
                  </figcaption>
                </figure>
              ))}
            </div>
            {/* edge fades */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-brand-900 to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-brand-900 to-transparent" />
          </div>
        </div>
      </section>

      {/* FAQ — white */}
      <section className="relative bg-white py-16">
        <Curve fill="#ffffff" />
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <div className="mb-8 text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3.5 py-1.5 text-xs font-semibold text-brand-700 ring-1 ring-brand-100">
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
    <div className={`overflow-hidden rounded-2xl border transition-all duration-300 ${open ? "border-brand-100 bg-white shadow-card" : "border-gray-100 bg-white hover:border-brand-100"}`}>
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left">
        <span className="font-semibold text-brand-800">{q}</span>
        <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full transition-all duration-300 ${open ? "rotate-180 bg-green-grad text-white shadow-btn" : "bg-brand-50 text-brand-600"}`}>
          <ChevronDown className="h-4 w-4" />
        </span>
      </button>
      <div className="grid transition-all duration-300 ease-out" style={{ gridTemplateRows: open ? "1fr" : "0fr" }}>
        <div className="overflow-hidden">
          <p className="px-5 pb-5 text-sm leading-relaxed text-gray-600">{a}</p>
        </div>
      </div>
    </div>
  );
}
