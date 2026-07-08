"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { History, Clock3, Heart, Play } from "lucide-react";
import { useStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";
import { cn, formatDuration } from "@/lib/utils";
import SignInPrompt from "@/components/SignInPrompt";

const TABS = [
  { id: "history", label: "History", icon: History },
  { id: "progress", label: "In Progress", icon: Clock3 },
  { id: "favourites", label: "Favourites", icon: Heart },
] as const;

interface Row {
  book: any;
  percent: number;
  completed: boolean;
}

export default function LibraryPage() {
  const { ready, signedIn } = useStore();
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("history");
  const [progress, setProgress] = useState<Row[]>([]);
  const [favs, setFavs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready || !signedIn) return;
    const supabase = createClient();
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const [prog, fav] = await Promise.all([
        supabase.from("listening_progress")
          .select("position_seconds, is_completed, last_listened_at, books(*, authors!books_author_id_fkey(name))")
          .eq("user_id", user.id).order("last_listened_at", { ascending: false }),
        supabase.from("favourites")
          .select("books(*, authors!books_author_id_fkey(name))").eq("user_id", user.id),
      ]);
      setProgress((prog.data ?? []).filter((r: any) => r.books).map((r: any) => ({
        book: r.books,
        percent: r.books.duration_seconds ? Math.min(100, Math.round((r.position_seconds / r.books.duration_seconds) * 100)) : 0,
        completed: r.is_completed,
      })));
      setFavs((fav.data ?? []).map((r: any) => r.books).filter(Boolean));
      setLoading(false);
    })();
  }, [ready, signedIn]);

  if (ready && !signedIn) {
    return <SignInPrompt title="Your library awaits" message="Sign in to see your history, in-progress books, and favourites all in one place." />;
  }

  const list =
    tab === "history" ? progress :
    tab === "progress" ? progress.filter((r) => !r.completed) :
    favs.map((b) => ({ book: b, percent: 0, completed: false }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 pb-28 sm:px-6 md:pb-10">
      <h1 className="display text-3xl text-gray-900 sm:text-4xl">Your library</h1>

      <div className="mt-6 flex gap-2 border-b border-gray-100">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              "flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition",
              tab === id ? "border-brand text-brand-700" : "border-transparent text-gray-400 hover:text-gray-600"
            )}
          >
            <Icon className="h-4 w-4" /> {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-20 text-center text-gray-400">Loading…</div>
      ) : list.length === 0 ? (
        <div className="py-20 text-center text-gray-400">Nothing here yet.</div>
      ) : (
        <div className="mt-6 space-y-3">
          {list.map((r) => (
            <LibraryRow key={r.book.id} book={r.book} percent={r.percent} completed={r.completed} showProgress={tab !== "favourites"} />
          ))}
        </div>
      )}
    </div>
  );
}

function LibraryRow({ book, percent, completed, showProgress }: { book: any; percent: number; completed: boolean; showProgress: boolean }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-3 shadow-soft transition hover:border-brand-100">
      <Link href={`/book/${book.id}`} className="relative aspect-square w-16 shrink-0 overflow-hidden rounded-xl sm:w-20">
        <Image src={book.cover_url} alt={book.title} fill sizes="80px" className="object-cover" />
      </Link>
      <div className="min-w-0 flex-1">
        <Link href={`/book/${book.id}`}>
          <h3 className="truncate font-semibold text-gray-900">{book.title}</h3>
        </Link>
        <p className="truncate text-sm text-gray-500">{book.authors?.name}</p>
        {showProgress && (
          <div className="mt-2">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
              <div className={cn("h-full rounded-full", completed ? "bg-brand" : "bg-gold-400")} style={{ width: `${completed ? 100 : percent}%` }} />
            </div>
            <p className="mt-1 text-xs text-gray-400">
              {completed ? "Completed" : `${percent}% · ${formatDuration(book.duration_seconds)}`}
            </p>
          </div>
        )}
      </div>
      <Link href={`/book/${book.id}/listen`} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand text-white transition hover:bg-brand-600">
        <Play className="h-5 w-5 translate-x-0.5 fill-current" />
      </Link>
    </div>
  );
}
