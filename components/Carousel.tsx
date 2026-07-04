"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import type { Book } from "@/lib/types";
import BookCard from "./BookCard";

export default function Carousel({
  title,
  subtitle,
  eyebrow,
  books,
}: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  books: Book[];
}) {
  const scroller = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: number) => {
    const w = scroller.current?.clientWidth ?? 400;
    scroller.current?.scrollBy({ left: dir * Math.min(w * 0.8, 640), behavior: "smooth" });
  };

  if (!books.length) return null;

  return (
    <section className="animate-fade-up">
      <div className="mb-4 flex items-end justify-between px-4 sm:px-6">
        <div>
          {eyebrow && (
            <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.28em] text-gold-500">{eyebrow}</p>
          )}
          <h2 className="font-serif text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">{title}</h2>
          {subtitle && <p className="mt-0.5 text-sm text-gray-500">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-3">
          <a href="#app-home" className="hidden items-center gap-1 text-sm font-semibold text-brand-700 hover:text-brand-500 sm:flex">
            See all <ArrowRight className="h-4 w-4" />
          </a>
          <div className="hidden gap-2 sm:flex">
            <button
              onClick={() => scrollBy(-1)}
              aria-label="Scroll left"
              className="grid h-10 w-10 place-items-center rounded-full bg-white text-brand-700 shadow-card ring-1 ring-brand-100 transition hover:-translate-y-0.5 hover:bg-brand hover:text-white"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => scrollBy(1)}
              aria-label="Scroll right"
              className="grid h-10 w-10 place-items-center rounded-full bg-white text-brand-700 shadow-card ring-1 ring-brand-100 transition hover:-translate-y-0.5 hover:bg-brand hover:text-white"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={scroller}
        className="no-scrollbar fade-x flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-4 pb-3 sm:px-6"
      >
        {books.map((b, i) => (
          <div key={b.id} className="snap-start">
            <BookCard book={b} index={i} />
          </div>
        ))}
      </div>
    </section>
  );
}
