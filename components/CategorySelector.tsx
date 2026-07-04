"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, Lock, Play, Star, Coins, ArrowRight, Sparkles } from "lucide-react";
import type { Book, Category, Subcategory } from "@/lib/types";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const TAGLINE: Record<string, string> = {
  "self-development": "Build better habits, focus and confidence — one chapter at a time.",
  "business-money": "Master money, investing and building things that last.",
  fiction: "Get lost in unforgettable stories and voices.",
  "history-society": "Understand how we got here — and where we're headed.",
  "health-mind": "Calm the noise and care for your mind.",
  spirituality: "Find stillness, meaning and presence.",
};

export default function CategorySelector({
  categories,
  subcategories,
  books,
}: {
  categories: Category[];
  subcategories: Subcategory[];
  books: Book[];
}) {
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [subId, setSubId] = useState<string | null>(null);

  const subs = useMemo(
    () => subcategories.filter((s) => s.category_id === categoryId),
    [subcategories, categoryId]
  );
  const category = categories.find((c) => c.id === categoryId);
  const subIds = subs.map((s) => s.id);

  const catBooks = books.filter((b) => subIds.includes(b.subcategory_id));
  const shelf = subId ? catBooks.filter((b) => b.subcategory_id === subId) : catBooks;

  const selectCategory = (id: string) => {
    setCategoryId(id);
    setSubId(null);
  };

  if (!categories.length) return null;

  return (
    <section className="px-4 sm:px-6">
      <div className="mb-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-500">Explore the shelves</p>
        <h2 className="display mt-1 text-3xl text-gray-900 sm:text-4xl">Browse by category</h2>
      </div>

      {/* category rail */}
      <div className="no-scrollbar mx-auto flex max-w-4xl gap-2 overflow-x-auto pb-2">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => selectCategory(c.id)}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition",
              categoryId === c.id
                ? "bg-brand-900 text-white shadow-btn"
                : "bg-white text-brand-800 shadow-soft ring-1 ring-black/5 hover:-translate-y-0.5 hover:shadow-card"
            )}
          >
            <span className="text-base">{c.icon}</span>
            {c.name}
          </button>
        ))}
      </div>

      {/* spotlight + grid */}
      <div className="mt-5 grid gap-5 lg:grid-cols-[340px_1fr]">
        {/* SPOTLIGHT */}
        <div className="relative overflow-hidden rounded-[1.75rem] forest p-7 text-white shadow-card">
          <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-gold-400/20 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-10 h-48 w-48 rounded-full bg-brand-400/20 blur-2xl" />
          <div className="relative flex h-full flex-col">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/10 text-3xl ring-1 ring-white/15">
              {category?.icon}
            </span>
            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.25em] text-gold-300">Category</p>
            <h3 className="mt-1 font-serif text-3xl font-semibold">{category?.name}</h3>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-brand-100">
              {category ? TAGLINE[category.slug] ?? "Handpicked audiobooks for curious minds." : ""}
            </p>

            <div className="mt-5 flex items-center gap-2 text-sm text-brand-50">
              <Sparkles className="h-4 w-4 text-gold-300" />
              {catBooks.length} audiobook{catBooks.length === 1 ? "" : "s"}
            </div>

            {/* subcategory filters */}
            <div className="mt-auto pt-6">
              <div className="flex flex-wrap gap-2">
                <Chip active={!subId} onClick={() => setSubId(null)}>All</Chip>
                {subs.map((s) => (
                  <Chip key={s.id} active={subId === s.id} onClick={() => setSubId(s.id)}>
                    {s.name}
                  </Chip>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* GRID */}
        <div>
          {shelf.length ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
              {shelf.map((b) => (
                <GridBook key={b.id} book={b} />
              ))}
            </div>
          ) : (
            <div className="grid h-full min-h-[16rem] place-items-center rounded-[1.75rem] bg-white text-center text-gray-400 shadow-soft ring-1 ring-black/5">
              No books in this shelf yet.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full px-3.5 py-1.5 text-xs font-medium transition",
        active ? "bg-gold-400 text-brand-900" : "bg-white/10 text-white ring-1 ring-white/20 hover:bg-white/20"
      )}
    >
      {children}
    </button>
  );
}

function GridBook({ book }: { book: Book }) {
  const { isFavourite, toggleFavourite, isBookUnlocked, signedIn } = useStore();
  const fav = isFavourite(book.id);
  const unlocked = isBookUnlocked(book.id, book.is_free);

  return (
    <div className="group overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-brand-100/50 transition-all hover:-translate-y-1 hover:shadow-cardHover">
      <Link href={`/book/${book.id}`} className="block">
        <div className="relative aspect-square overflow-hidden">
          <Image src={book.cover_url} alt={book.title} fill sizes="200px" className="object-cover transition-transform duration-500 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-900/50 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

          {/* price badge */}
          <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold text-brand-700 shadow-soft backdrop-blur">
            {book.is_free ? "FREE" : <><Coins className="h-3.5 w-3.5 text-gold-500" /> {book.coin_price}</>}
          </span>

          {signedIn && (
            <button
              onClick={(e) => { e.preventDefault(); toggleFavourite(book.id); }}
              className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-gray-700 shadow backdrop-blur transition hover:scale-110"
              aria-label="Toggle favourite"
            >
              <Heart className={cn("h-4 w-4", fav && "fill-rose-500 text-rose-500")} />
            </button>
          )}

          {!unlocked && !book.is_free && (
            <span className="absolute bottom-2 right-2 grid h-7 w-7 place-items-center rounded-full bg-black/45 text-white backdrop-blur">
              <Lock className="h-3.5 w-3.5" />
            </span>
          )}

          {/* hover play */}
          <span className="absolute bottom-2 left-2 grid h-9 w-9 translate-y-2 place-items-center rounded-full bg-gold-400 text-brand-800 opacity-0 shadow-lg transition-all group-hover:translate-y-0 group-hover:opacity-100">
            <Play className="h-4 w-4 translate-x-0.5 fill-current" />
          </span>
        </div>
      </Link>
      <div className="p-3">
        <p className="truncate text-[11px] text-gray-400">{book.author_name}</p>
        <Link href={`/book/${book.id}`}>
          <h3 className="line-clamp-1 text-sm font-semibold text-gray-900 group-hover:text-brand-700">{book.title}</h3>
        </Link>
        <div className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-gold-600">
          <Star className="h-3 w-3 fill-current" /> {book.rating.toFixed(1)}
          <span className="text-gray-300">·</span>
          <span className="text-gray-400">{unlocked ? "Listen" : "Unlock"}</span>
        </div>
      </div>
    </div>
  );
}
