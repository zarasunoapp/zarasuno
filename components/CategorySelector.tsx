"use client";

import { useMemo, useState } from "react";
import { ChevronLeft } from "lucide-react";
import type { Book, Category, Subcategory } from "@/lib/types";
import BookCard from "./BookCard";
import { cn } from "@/lib/utils";

// Two-level browse: categories only → pick one to open it → its subcategory
// filters + books, with a "back to categories" button to return.
export default function CategorySelector({
  categories,
  subcategories,
  books,
}: {
  categories: Category[];
  subcategories: Subcategory[];
  books: Book[];
}) {
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [subId, setSubId] = useState<string | null>(null);

  const category = categories.find((c) => c.id === categoryId) ?? null;
  const subs = useMemo(
    () => subcategories.filter((s) => s.category_id === categoryId),
    [subcategories, categoryId]
  );

  const subIds = subs.map((s) => s.id);
  const catBooks = books.filter((b) => subIds.includes(b.subcategory_id));
  const shelf = subId ? catBooks.filter((b) => b.subcategory_id === subId) : catBooks;

  const openCategory = (id: string) => {
    setCategoryId(id);
    setSubId(null);
  };

  if (!categories.length) return null;

  return (
    <section className="px-4 sm:px-6">
      <div className="mb-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-500">Explore the shelves</p>
        <h2 className="display mt-1 text-3xl text-gray-900 sm:text-4xl">Browse by interest</h2>
      </div>

      {/* ===== Level 1 — categories as simple pills ===== */}
      {!category && (
        <div className="flex flex-wrap justify-center gap-2.5 sm:gap-3">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => openCategory(c.id)}
              className="flex items-center gap-2.5 rounded-full bg-white py-2.5 pl-2.5 pr-5 text-sm font-semibold text-brand-800 shadow-soft ring-1 ring-black/5 transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-50 hover:shadow-card"
            >
              <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-50 text-base">{c.icon}</span>
              {c.name}
            </button>
          ))}
        </div>
      )}

      {/* ===== Level 2 — one category: back button + subcategory filters + books ===== */}
      {category && (
        <>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setCategoryId(null)}
              className="flex shrink-0 items-center gap-1.5 rounded-full bg-white py-2 pl-2 pr-4 text-sm font-semibold text-brand-700 shadow-soft ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-card"
            >
              <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-50">
                <ChevronLeft className="h-4 w-4" />
              </span>
              Categories
            </button>
            <h3 className="flex min-w-0 items-center gap-2 truncate text-lg font-bold text-gray-900">
              <span className="text-xl">{category.icon}</span> {category.name}
            </h3>
          </div>

          {/* subcategory filter pills */}
          {subs.length > 0 && (
            <div className="no-scrollbar -mx-4 mt-6 flex items-center gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
              <button
                onClick={() => setSubId(null)}
                className={cn(
                  "shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition",
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
                    "shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition",
                    subId === s.id ? "bg-brand-900 text-white shadow" : "bg-gray-50 text-brand-700 ring-1 ring-gray-200 hover:bg-brand-50"
                  )}
                >
                  {s.name}
                </button>
              ))}
            </div>
          )}

          {/* books */}
          <div className="mt-7 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:justify-center sm:gap-5">
            {shelf.length ? (
              shelf.map((b) => <BookCard key={b.id} book={b} fluid />)
            ) : (
              <div className="col-span-2 grid min-h-[12rem] w-full max-w-md place-items-center rounded-3xl bg-gray-50 text-center text-gray-400 ring-1 ring-black/5">
                No books in this shelf yet.
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}
