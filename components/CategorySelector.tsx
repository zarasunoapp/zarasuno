"use client";

import { useMemo, useState } from "react";
import type { Book, Category, Subcategory } from "@/lib/types";
import BookCard from "./BookCard";
import { cn } from "@/lib/utils";

// Category → subcategory → books. Pick a category, its shelves appear; pick a
// shelf and its books show as the same book cards used everywhere.
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
      <div className="mb-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-500">Explore the shelves</p>
        <h2 className="display mt-1 text-3xl text-gray-900 sm:text-4xl">Browse by category</h2>
      </div>

      {/* Step 1 — category chips (wrap + center, responsive) */}
      <div className="mx-auto flex max-w-5xl flex-wrap justify-center gap-2.5 sm:gap-3">
        {categories.map((c) => {
          const active = categoryId === c.id;
          return (
            <button
              key={c.id}
              onClick={() => selectCategory(c.id)}
              className={cn(
                "flex items-center gap-2.5 rounded-2xl py-2.5 pl-2.5 pr-4 text-sm font-semibold transition-all duration-200",
                active
                  ? "bg-green-grad text-white shadow-btn"
                  : "bg-white text-brand-800 shadow-soft ring-1 ring-black/5 hover:-translate-y-0.5 hover:shadow-card"
              )}
            >
              <span className={cn("grid h-8 w-8 place-items-center rounded-xl text-base transition", active ? "bg-white/20" : "bg-brand-50")}>
                {c.icon}
              </span>
              {c.name}
            </button>
          );
        })}
      </div>

      {/* Step 2 — shelves (subcategories) */}
      {subs.length > 0 && (
        <div className="mx-auto mt-7 flex max-w-4xl flex-wrap items-center justify-center gap-2 border-t border-gray-100 pt-6">
          <button
            onClick={() => setSubId(null)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold transition",
              !subId ? "bg-brand-900 text-white shadow" : "bg-gray-50 text-brand-700 ring-1 ring-gray-200 hover:bg-brand-50"
            )}
          >
            All
          </button>
          {subs.map((s) => (
            <button
              key={s.id}
              onClick={() => setSubId(s.id)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-semibold transition",
                subId === s.id ? "bg-brand-900 text-white shadow" : "bg-gray-50 text-brand-700 ring-1 ring-gray-200 hover:bg-brand-50"
              )}
            >
              {s.name}
            </button>
          ))}
        </div>
      )}

      {/* Step 3 — books (same book cards) */}
      <div className="mt-9 flex flex-wrap justify-center gap-5">
        {shelf.length ? (
          shelf.map((b) => <BookCard key={b.id} book={b} />)
        ) : (
          <div className="grid min-h-[12rem] w-full max-w-md place-items-center rounded-3xl bg-gray-50 text-center text-gray-400 ring-1 ring-black/5">
            No books in this shelf yet.
          </div>
        )}
      </div>
    </section>
  );
}
