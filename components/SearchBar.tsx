"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type Item = { id: string; title: string; cover_url: string; author: string; category: string };

// Header search — books by title / author / category, with live suggestions.
// Desktop shows an inline pill; smaller screens use an icon that opens a sheet.
export default function SearchBar() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [all, setAll] = useState<Item[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [openDesktop, setOpenDesktop] = useState(false);
  const [openMobile, setOpenMobile] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  // close the desktop dropdown when clicking/tapping anywhere outside it
  useEffect(() => {
    if (!openDesktop) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpenDesktop(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("touchstart", onDown); };
  }, [openDesktop]);

  const load = async () => {
    if (all || loading) return;
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("books")
      .select("id,title,cover_url,authors!books_author_id_fkey(name),subcategories(name,categories(name))")
      .eq("is_published", true)
      .limit(500);
    setAll(
      (data ?? []).map((b: any) => ({
        id: b.id,
        title: b.title,
        cover_url: b.cover_url,
        author: b.authors?.name ?? "",
        category: b.subcategories?.categories?.name ?? b.subcategories?.name ?? "",
      }))
    );
    setLoading(false);
  };

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s || !all) return [];
    return all
      .filter((x) => x.title.toLowerCase().includes(s) || x.author.toLowerCase().includes(s) || x.category.toLowerCase().includes(s))
      .slice(0, 8);
  }, [q, all]);

  const goFirst = () => {
    if (results[0]) {
      router.push(`/book/${results[0].id}`);
      setQ(""); setOpenDesktop(false); setOpenMobile(false);
    }
  };

  const Suggestions = ({ onPick }: { onPick: () => void }) => (
    <>
      {loading && !all ? (
        <div className="flex items-center gap-2 px-4 py-6 text-sm text-gray-400"><Loader2 className="h-4 w-4 animate-spin" /> Loading books…</div>
      ) : q.trim() === "" ? (
        <p className="px-4 py-6 text-center text-sm text-gray-400">Search by book, author, or keywords.</p>
      ) : results.length === 0 ? (
        <p className="px-4 py-6 text-center text-sm text-gray-400">No matches for “{q}”.</p>
      ) : (
        results.map((r) => (
          <Link
            key={r.id}
            href={`/book/${r.id}`}
            onClick={() => { setQ(""); onPick(); }}
            className="flex items-center gap-3 px-3 py-2.5 hover:bg-brand-50/60"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={r.cover_url} alt="" className="h-11 w-11 shrink-0 rounded-lg object-cover ring-1 ring-black/5" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-gray-900">{r.title}</p>
              <p className="truncate text-xs text-gray-500">{r.author}{r.category ? ` · ${r.category}` : ""}</p>
            </div>
          </Link>
        ))
      )}
    </>
  );

  return (
    <>
      {/* Desktop inline pill — only on wide screens so it can't crowd the nav */}
      <div ref={boxRef} className="relative hidden xl:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
        <input
          value={q}
          onFocus={() => { load(); setOpenDesktop(true); }}
          onChange={(e) => { setQ(e.target.value); load(); }}
          onKeyDown={(e) => e.key === "Enter" && goFirst()}
          placeholder="Search books, authors…"
          className="w-56 rounded-full border border-white/15 bg-white/10 py-2 pl-9 pr-8 text-sm text-white placeholder:text-white/50 outline-none transition focus:w-72 focus:bg-white/15"
        />
        {q && (
          <button onClick={() => setQ("")} className="absolute right-2 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full text-white/60 hover:bg-white/10">
            <X className="h-3.5 w-3.5" />
          </button>
        )}
        {openDesktop && (
          <div className="absolute left-0 top-12 z-50 w-80 overflow-hidden rounded-2xl bg-white py-1 shadow-2xl ring-1 ring-black/10">
            <Suggestions onPick={() => setOpenDesktop(false)} />
          </div>
        )}
      </div>

      {/* Mobile / tablet icon → top sheet */}
      <button
        onClick={() => { load(); setOpenMobile(true); }}
        aria-label="Search"
        className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/15 transition hover:bg-white/20 xl:hidden"
      >
        <Search className="h-[18px] w-[18px]" />
      </button>

      {openMobile && (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm" onClick={() => setOpenMobile(false)}>
          <div className="mx-auto mt-16 w-[92%] max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 border-b border-gray-100 px-3 py-2.5">
              <Search className="h-4 w-4 shrink-0 text-gray-400" />
              <input
                autoFocus
                value={q}
                onChange={(e) => { setQ(e.target.value); load(); }}
                onKeyDown={(e) => e.key === "Enter" && goFirst()}
                placeholder="Search books, authors, categories…"
                className="w-full py-1.5 text-sm outline-none"
              />
              <button onClick={() => setOpenMobile(false)} className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-gray-400 hover:bg-gray-100">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="no-scrollbar max-h-[60vh] overflow-y-auto">
              <Suggestions onPick={() => setOpenMobile(false)} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
