"use client";

import type { ReactNode } from "react";
import type { Book, Category, Subcategory } from "@/lib/types";
import type { HomeSection, Faq, FeaturedBook, Testimonial, PopularAuthor, HeroFeature } from "@/lib/queries";
import LandingHero from "./LandingHero";
import SignedInHero from "./SignedInHero";
import MarketingSections from "./MarketingSections";
import FeaturedBooks from "./FeaturedBooks";
import AuthorsCarousel from "./AuthorsCarousel";
import Curve from "./Curve";
import Carousel from "./Carousel";
import CategorySelector from "./CategorySelector";
import OnboardingModal from "./OnboardingModal";
import ReviewsFaq from "./ReviewsFaq";
import Reveal from "./Reveal";

// Feed order: books of the month → featured → most popular → recently added →
// language (Urdu) → everything else. Category carousels are dropped (users
// explore via "Browse by interest" instead).
const ORDER: Record<string, number> = {
  books_of_month: 1,
  most_popular: 2,
  recently_added: 3,
  language: 4,
};
const prio = (t: string) => ORDER[t] ?? 5;

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
  faqs,
  featuredBooks = [],
  testimonials = [],
  popularAuthors = [],
  heroFeature = null,
}: {
  signedIn: boolean;
  sections: HomeSection[];
  allBooks: Book[];
  categories: Category[];
  subcategories: Subcategory[];
  faqs?: Faq[];
  featuredBooks?: FeaturedBook[];
  testimonials?: Testimonial[];
  popularAuthors?: PopularAuthor[];
  heroFeature?: HeroFeature | null;
}) {

  // Build the app-home feed in the desired order.
  const feedSections = sections
    .filter((s) => s.type !== "category") // drop category carousels (e.g. "Self Development")
    .sort((a, b) => prio(a.type) - prio(b.type));

  const carouselBlock = (s: HomeSection) => ({
    key: s.id,
    node: (
      <div className="mx-auto max-w-[96rem]">
        <Carousel eyebrow={EYEBROWS[s.type]} title={s.title} subtitle={s.type === "books_of_month" ? undefined : SUBTITLES[s.type]} books={s.books} />
      </div>
    ),
  });

  const blocks: { key: string; node: ReactNode }[] = [];
  // 1. Books of the Month
  const bom = feedSections.find((s) => s.type === "books_of_month");
  if (bom) blocks.push(carouselBlock(bom));
  // 2. Recommended for You (signed-in, from selected categories, weekly)
  const rec = feedSections.find((s) => s.type === "recommended");
  if (rec) blocks.push(carouselBlock(rec));
  // 3. Featured Books
  if (featuredBooks.length > 0) blocks.push({ key: "featured", node: <FeaturedBooks featured={featuredBooks} /> });
  // 4. the rest (most popular → recently added → Urdu → …)
  feedSections.filter((s) => s.type !== "books_of_month" && s.type !== "recommended").forEach((s) => blocks.push(carouselBlock(s)));
  // 5. Popular authors
  if (popularAuthors.length > 0) blocks.push({ key: "authors", node: <AuthorsCarousel authors={popularAuthors} /> });

  // Browse by interest — in the feed for signed-in users; for signed-out it
  // moves below the "Why ZaraSuno?" section (rendered separately, further down).
  const browseNode =
    categories.length > 0 ? (
      <div id="browse-categories" className="mx-auto max-w-[96rem] scroll-mt-24">
        <CategorySelector categories={categories} subcategories={subcategories} books={allBooks} />
      </div>
    ) : null;
  // 6. Browse by interest (signed-in only here)
  if (signedIn && browseNode) blocks.push({ key: "categories", node: browseNode });

  return (
    <>
      {signedIn ? <SignedInHero /> : <LandingHero covers={allBooks} heroFeature={heroFeature} />}

      {/* App-home feed — one connected white surface */}
      <div id="app-home" className="relative bg-white">
        <Curve fill="#ffffff" />
        <div className="space-y-10 py-12">
          {blocks.map((b) => (
            <Reveal key={b.key}>{b.node}</Reveal>
          ))}
        </div>
      </div>

      {/* Signed-out tail — order: Browse by interest → Why ZaraSuno → Reviews → FAQ */}
      {!signedIn && (
        <>
          {browseNode && <div className="bg-white py-12">{browseNode}</div>}
          <MarketingSections />
          <ReviewsFaq faqs={faqs} testimonials={testimonials} />
        </>
      )}

      <OnboardingModal categories={categories} />
    </>
  );
}
