"use client";

import type { ReactNode } from "react";
import type { Book, Category, Subcategory } from "@/lib/types";
import type { HomeSection, Faq, FeaturedBook } from "@/lib/queries";
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
  featuredBooks = [],
}: {
  signedIn: boolean;
  sections: HomeSection[];
  allBooks: Book[];
  categories: Category[];
  subcategories: Subcategory[];
  bookOfDay: Book | null;
  faqs?: Faq[];
  featuredBooks?: FeaturedBook[];
}) {

  // Build the app-home feed as an ordered list of blocks (carousels + category).
  const blocks: { key: string; node: ReactNode }[] = [];
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
          <MarketingSections featured={featuredBooks} />
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
