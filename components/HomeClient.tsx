"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, Sparkles } from "lucide-react";
import type { Book, Category, Subcategory } from "@/lib/types";
import type { HomeSection, Faq } from "@/lib/queries";
import { formatDuration } from "@/lib/utils";
import LandingHero from "./LandingHero";
import SignedInHero from "./SignedInHero";
import MarketingSections from "./MarketingSections";
import Curve from "./Curve";
import Carousel from "./Carousel";
import CategorySelector from "./CategorySelector";
import OnboardingModal from "./OnboardingModal";
import ReviewsFaq from "./ReviewsFaq";
import Reveal from "./Reveal";

const SUBTITLES: Record<string, string> = {
  books_of_month: "Hand-picked by our editors this month",
  most_popular: "What everyone's listening to right now",
  recently_added: "Fresh off the press",
  recommended: "Chosen just for you",
  top_selling: "Our best-selling titles",
  category: "More from a shelf you love",
  language: "Titles in your language",
  collection: "A curated collection",
  manual: "Featured picks",
};

const EYEBROWS: Record<string, string> = {
  books_of_month: "Editors' pick",
  most_popular: "Trending now",
  recently_added: "Just added",
  recommended: "For you",
  top_selling: "Bestsellers",
  category: "Collection",
  language: "In your language",
  collection: "Collection",
  manual: "Featured",
};

export default function HomeClient({
  signedIn,
  sections,
  allBooks,
  categories,
  subcategories,
  bookOfDay,
  faqs,
}: {
  signedIn: boolean;
  sections: HomeSection[];
  allBooks: Book[];
  categories: Category[];
  subcategories: Subcategory[];
  bookOfDay: Book | null;
  faqs?: Faq[];
}) {
  const featured = (sections.find((s) => s.type === "books_of_month")?.books ?? allBooks).slice(0, 3);

  // Book-of-the-Day banner (signed-out only; signed-in users see it in the hero)
  const bookOfDayNode = !signedIn && bookOfDay && (
    <div className="mx-auto max-w-[96rem] px-4 sm:px-6">
      <div className="shine group relative overflow-hidden rounded-[1.75rem] bg-brand-900 p-6 text-white shadow-card ring-1 ring-white/10 sm:p-10">
        <Image src={bookOfDay.cover_url} alt="" fill sizes="1200px" className="object-cover opacity-20 transition-transform duration-[3s] group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-900 via-brand-900/92 to-brand-800/60" />
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-gold-400/25 blur-3xl" />
        <div className="relative flex flex-col items-start gap-6 sm:flex-row sm:items-center">
          <Link href={`/book/${bookOfDay.id}`} className="animate-float relative aspect-square w-32 shrink-0 overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/15 sm:w-40">
            <Image src={bookOfDay.cover_url} alt={bookOfDay.title} fill sizes="160px" className="object-cover" />
          </Link>
          <div className="flex-1">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-400 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-brand-900">
              <Sparkles className="h-3 w-3" /> Book of the Day
            </span>
            <h2 className="mt-3 font-serif text-2xl font-semibold sm:text-3xl">{bookOfDay.title}</h2>
            <p className="text-brand-100">
              {bookOfDay.author_name} · {formatDuration(bookOfDay.duration_seconds)} · {bookOfDay.chapter_count} chapters
            </p>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-brand-100 line-clamp-2">{bookOfDay.description}</p>
            <Link href={`/book/${bookOfDay.id}`} className="mt-5 inline-flex items-center gap-2 rounded-full bg-gold-400 px-5 py-2.5 text-sm font-semibold text-brand-900 shadow-lg transition hover:-translate-y-0.5 hover:bg-gold-300">
              <Play className="h-4 w-4 fill-current" /> Start listening
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  // Build the app-home feed as an ordered list of blocks; each becomes its own
  // alternating band (green ↔ near-white) separated by a curve.
  const blocks: { key: string; node: ReactNode }[] = [];
  if (bookOfDayNode) blocks.push({ key: "bod", node: bookOfDayNode });
  sections.forEach((s, i) => {
    blocks.push({
      key: s.id,
      node: (
        <div className="mx-auto max-w-[96rem]">
          <Carousel eyebrow={EYEBROWS[s.type]} title={s.title} subtitle={SUBTITLES[s.type]} books={s.books} />
        </div>
      ),
    });
    if (i === 0 && categories.length > 0) {
      blocks.push({
        key: "categories",
        node: (
          <div className="mx-auto max-w-[96rem]">
            <CategorySelector categories={categories} subcategories={subcategories} books={allBooks} />
          </div>
        ),
      });
    }
  });

  return (
    <>
      {signedIn ? (
        <SignedInHero bookOfDay={bookOfDay} />
      ) : (
        <>
          <LandingHero covers={allBooks} />
          <MarketingSections featured={featured} />
        </>
      )}

      {/* App-home feed — one connected white surface */}
      <div id="app-home" className="relative bg-white">
        <Curve fill="#ffffff" />
        <div className="space-y-16 py-16">
          {blocks.map((b) => (
            <Reveal key={b.key}>{b.node}</Reveal>
          ))}
        </div>
      </div>

      {/* Reviews + FAQ — just above the footer (shown for everyone) */}
      <ReviewsFaq faqs={faqs} />

      <OnboardingModal categories={categories} />
    </>
  );
}
