"use client";

import Link from "next/link";
import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PopularAuthor } from "@/lib/queries";
import Avatar from "./Avatar";

export default function AuthorsCarousel({ authors }: { authors: PopularAuthor[] }) {
  const scroller = useRef<HTMLDivElement>(null);
  if (!authors.length) return null;

  const scrollBy = (dir: number) => {
    const w = scroller.current?.clientWidth ?? 400;
    scroller.current?.scrollBy({ left: dir * Math.min(w * 0.8, 640), behavior: "smooth" });
  };

  return (
    <section className="animate-fade-up mx-auto max-w-[96rem]">
      <div className="mb-4 flex items-end justify-between px-4 sm:px-6">
        <div>
          <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.28em] text-gold-500">Voices you&apos;ll love</p>
          <h2 className="font-serif text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Popular authors</h2>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/authors" className="rounded-full bg-brand-900 px-4 py-2 text-sm font-semibold text-white shadow-card transition hover:-translate-y-0.5 hover:bg-brand-800">
            See more
          </Link>
          <div className="hidden gap-2 sm:flex">
            <button onClick={() => scrollBy(-1)} aria-label="Scroll left" className="grid h-10 w-10 place-items-center rounded-full bg-white text-brand-700 shadow-card ring-1 ring-brand-100 transition hover:-translate-y-0.5 hover:bg-brand hover:text-white">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button onClick={() => scrollBy(1)} aria-label="Scroll right" className="grid h-10 w-10 place-items-center rounded-full bg-white text-brand-700 shadow-card ring-1 ring-brand-100 transition hover:-translate-y-0.5 hover:bg-brand hover:text-white">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div ref={scroller} className="no-scrollbar fade-x flex snap-x gap-4 overflow-x-auto scroll-smooth px-4 pb-3 sm:px-6">
        {authors.slice(0, 12).map((a) => (
          <Link
            key={a.id}
            href={`/author/${a.id}`}
            className="group flex w-28 shrink-0 snap-start flex-col items-center text-center sm:w-32"
          >
            <span className="relative rounded-full ring-2 ring-transparent transition group-hover:ring-brand-300">
              {a.avatar_url ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={a.avatar_url} alt={a.name} className="h-20 w-20 rounded-full object-cover ring-4 ring-white shadow-card sm:h-24 sm:w-24" />
              ) : (
                <Avatar name={a.name} size={88} className="shadow-card ring-4 ring-white" />
              )}
            </span>
            <span className="mt-3 line-clamp-1 text-sm font-semibold text-gray-900 group-hover:text-brand-700">{a.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
