"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, X, Headphones, Baby } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import BookCard from "@/components/BookCard";
import PageLoader from "@/components/PageLoader";
import type { Book } from "@/lib/types";

type Row = Book & { _author: string; _category: string; _sub: string };

export default function ExplorePage() {
  const [q, setQ] = useState("");
  const [books, setBooks] = useState<Row[] | null>(null);
  const [quick, setQuick] = useState<"all" | "full" | "children">("all");
  const [cat, setCat] = useState<string>("");
  const [sub, setSub] = useState<string>("");

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data } = await supabase
        .from("books")
        .select("*, authors!books_author_id_fkey(name), subcategories(name, categories(name))")
        .eq("is_published", true);
      const rows: Row[] = (data ?? []).map((b: any) => ({
        ...b,
        author_name: b.authors?.name ?? "",
        _author: b.authors?.name ?? "",
        _category: b.subcategories?.categories?.name ?? "",
        _sub: b.subcategories?.name ?? "",
        cover_url: b.cover_url || `https://picsum.photos/seed/${b.id}/600/600`,
      }));
      setBooks(rows);
    })();
  }, []);

  const categories = useMemo(() => Array.from(new Set((books ?? []).map((b) => b._category).filter(Boolean))).sort(), [books]);
  const subcats = useMemo(
    () => (cat ? Array.from(new Set((books ?? []).filter((b) => b._category === cat).map((b) => b._sub).filter(Boolean))).sort() : []),
    [books, cat]
  );

  const results = useMemo(() => {
    if (!books) return [];
    const s = q.trim().toLowerCase();
    return books.filter((b) => {
      const matchesQ = !s || b.title.toLowerCase().includes(s) || b._author.toLowerCase().includes(s) || b._category.toLowerCase().includes(s) || b._sub.toLowerCase().includes(s);
      const matchesCat = !cat || b._category === cat;
      const matchesSub = !sub || b._sub === sub;
      const matchesQuick =
        quick === "all" ? true :
        quick === "full" ? b.book_type === "audiobook" :
        /child|kid/i.test(`${b._category} ${b._sub}`); // "For children"
      return matchesQ && matchesCat && matchesSub && matchesQuick;
    });
  }, [q, books, cat, sub, quick]);

  const chip = (active: boolean) =>
    cn("shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition", active ? "bg-brand-900 text-white shadow" : "bg-gray-50 text-brand-700 ring-1 ring-gray-200 hover:bg-brand-50");

  return (
    <div className="mx-auto max-w-[96rem] px-4 py-8 pb-28 sm:px-6 md:pb-12">
      <h1 className="display text-3xl text-gray-900 sm:text-4xl">Explore</h1>
      <p className="mt-1 text-gray-500">Search by title, author, or category.</p>

      {/* search */}
      <div className="relative mt-5 max-w-2xl">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search books, authors, categories…"
          className="w-full rounded-2xl border border-gray-200 bg-white py-3.5 pl-12 pr-11 text-sm shadow-soft outline-none transition focus:border-brand focus:ring-2 focus:ring-brand-100"
        />
        {q && (
          <button onClick={() => setQ("")} className="absolute right-3 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-gray-400 hover:bg-gray-100">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* quick filters: Full book / For children */}
      <div className="mt-4 flex flex-wrap gap-2">
        <button onClick={() => setQuick("all")} className={chip(quick === "all")}>All</button>
        <button onClick={() => setQuick("full")} className={cn(chip(quick === "full"), "flex items-center gap-1.5")}><Headphones className="h-4 w-4" /> Full book</button>
        <button onClick={() => setQuick("children")} className={cn(chip(quick === "children"), "flex items-center gap-1.5")}><Baby className="h-4 w-4" /> For children</button>
      </div>

      {/* categories */}
      {categories.length > 0 && (
        <div className="no-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
          <button onClick={() => { setCat(""); setSub(""); }} className={chip(!cat)}>All categories</button>
          {categories.map((c) => (
            <button key={c} onClick={() => { setCat((v) => (v === c ? "" : c)); setSub(""); }} className={chip(cat === c)}>{c}</button>
          ))}
        </div>
      )}

      {/* subcategories (when a category is picked) */}
      {subcats.length > 0 && (
        <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto border-t border-gray-100 px-4 pt-3 sm:mx-0 sm:flex-wrap sm:px-0">
          <button onClick={() => setSub("")} className={chip(!sub)}>All</button>
          {subcats.map((sc) => (
            <button key={sc} onClick={() => setSub((v) => (v === sc ? "" : sc))} className={chip(sub === sc)}>{sc}</button>
          ))}
        </div>
      )}

      {/* results */}
      <div className="mt-8">
        {!books ? (
          <PageLoader label="Loading books…" />
        ) : results.length === 0 ? (
          <div className="grid place-items-center rounded-3xl bg-gray-50 py-20 text-center text-gray-400 ring-1 ring-black/5">
            {quick === "children" ? "No children's books yet." : q ? `No results for “${q}”.` : "No books found."}
          </div>
        ) : (
          <>
            <p className="mb-4 text-sm text-gray-400">{results.length} {results.length === 1 ? "result" : "results"}</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 lg:grid-cols-6">
              {results.map((b) => <BookCard key={b.id} book={b} fluid />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
