"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Play, Lock, Heart, Download, Star, Clock, ListMusic, Coins, Check, ChevronLeft, Share2, Headphones,
} from "lucide-react";
import type { Author, Book, Chapter } from "@/lib/types";
import { useStore } from "@/lib/store";
import { cn, formatDuration, formatClock, formatCount } from "@/lib/utils";
import Curve from "./Curve";
import Carousel from "./Carousel";

export default function BookDetailClient({
  book,
  author,
  chapters,
  categoryName,
  related,
}: {
  book: Book;
  author: Author | null;
  chapters: Chapter[];
  categoryName: string | null;
  related: Book[];
}) {
  const router = useRouter();
  const { signedIn, coins, isBookUnlocked, unlockBook, isFavourite, toggleFavourite } = useStore();
  const [toast, setToast] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const unlocked = isBookUnlocked(book.id, book.is_free);
  const fav = isFavourite(book.id);

  const flash = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(null), 2600);
  };

  const handleUnlock = async () => {
    if (!signedIn) return router.push("/login");
    if (coins < book.coin_price) return router.push("/coins?need=" + book.coin_price);
    setBusy(true);
    const res = await unlockBook(book.id);
    setBusy(false);
    if (res.ok) flash(`Unlocked! ${book.coin_price} coins spent.`);
    else if (res.reason === "insufficient_coins") router.push("/coins?need=" + book.coin_price);
    else flash("Something went wrong. Please try again.");
  };

  const handleDownload = () => {
    if (!unlocked) return router.push("/coins?need=" + book.coin_price);
    flash("Preparing offline download…");
  };

  const handleListen = () => {
    if (unlocked) router.push(`/book/${book.id}/listen`);
  };

  return (
    <div className="pb-24 md:pb-10">
      {/* ============ DARK HERO HEADER ============ */}
      <section className="grain relative -mt-20 overflow-hidden bg-brand-900 pb-14 pt-28 text-white sm:pt-32">
        {/* blurred cover + gradients */}
        <Image src={book.cover_url} alt="" fill sizes="100vw" className="scale-110 object-cover opacity-25 blur-2xl" />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-900/85 via-brand-900/80 to-brand-900" />
        <div className="absolute inset-0 bg-hero-mesh opacity-70" />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <button
            onClick={() => router.back()}
            className="mb-6 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-2 text-sm font-medium text-white ring-1 ring-white/15 backdrop-blur transition hover:bg-white/20"
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </button>

          <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-start">
            {/* cover */}
            <div className="animate-float relative aspect-square w-52 shrink-0 overflow-hidden rounded-3xl shadow-2xl ring-1 ring-white/15 sm:w-60">
              <Image src={book.cover_url} alt={book.title} fill sizes="240px" className="object-cover" priority />
              {!unlocked && !book.is_free && (
                <span className="absolute left-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-black/45 text-white backdrop-blur">
                  <Lock className="h-4 w-4" />
                </span>
              )}
              {book.is_free && (
                <span className="absolute left-3 top-3 rounded-full bg-gold-grad px-2.5 py-0.5 text-[10px] font-bold uppercase text-brand-900 shadow-gold">Free</span>
              )}
            </div>

            {/* meta */}
            <div className="flex-1 text-center sm:pt-2 sm:text-left">
              {categoryName && (
                <span className="text-xs font-bold uppercase tracking-[0.22em] text-gold-300">{categoryName}</span>
              )}
              <h1 className="display mt-2 text-4xl leading-[1.02] text-white sm:text-5xl">{book.title}</h1>
              {book.subtitle && <p className="mt-2 text-lg text-brand-100">{book.subtitle}</p>}
              <p className="mt-2 text-sm font-medium text-brand-100">by {author?.name}</p>

              <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-brand-100 sm:justify-start">
                <span className="flex items-center gap-1.5 font-semibold text-gold-300"><Star className="h-4 w-4 fill-current" /> {book.rating.toFixed(1)}</span>
                <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-brand-300" /> {formatDuration(book.duration_seconds)}</span>
                <span className="flex items-center gap-1.5"><ListMusic className="h-4 w-4 text-brand-300" /> {book.chapter_count} chapters</span>
                <span className="flex items-center gap-1.5"><Headphones className="h-4 w-4 text-brand-300" /> {formatCount(book.listen_count)} plays</span>
              </div>

              {/* actions */}
              <div className="mt-7 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
                {unlocked ? (
                  <button onClick={handleListen} className="btn-green flex items-center gap-2 rounded-full px-7 py-3.5 text-base font-semibold">
                    <Play className="h-5 w-5 fill-current" /> Listen now
                  </button>
                ) : (
                  <>
                    <button disabled className="flex cursor-not-allowed items-center gap-2 rounded-full bg-white/10 px-7 py-3.5 text-base font-semibold text-white/40 ring-1 ring-white/10">
                      <Play className="h-5 w-5" /> Listen
                    </button>
                    {!book.is_free && (
                      <button onClick={handleUnlock} disabled={busy} className="btn-gold flex items-center gap-2 rounded-full px-6 py-3.5 text-base font-semibold disabled:opacity-60">
                        <Coins className="h-5 w-5" /> {busy ? "Unlocking…" : `Unlock · ${book.coin_price}`}
                      </button>
                    )}
                  </>
                )}
                {unlocked && (
                  <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-3 text-sm font-semibold text-gold-200 ring-1 ring-white/15">
                    <Check className="h-4 w-4" /> {book.is_free ? "Free" : "Unlocked"}
                  </span>
                )}

                <IconBtn onClick={() => (signedIn ? toggleFavourite(book.id) : router.push("/login"))}>
                  <Heart className={cn("h-5 w-5", fav && "fill-rose-500 text-rose-500")} />
                </IconBtn>
                <IconBtn onClick={handleDownload}><Download className="h-5 w-5" /></IconBtn>
                <IconBtn onClick={() => flash("Link copied to clipboard")}><Share2 className="h-5 w-5" /></IconBtn>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ BODY ============ */}
      <div className="relative bg-ivory">
        <Curve fill="#F7F3EA" />
        <div className="mx-auto grid max-w-6xl gap-10 px-4 pt-8 sm:px-6 lg:grid-cols-3">
        <div className="space-y-10 lg:col-span-2">
          <section>
            <h2 className="font-serif text-2xl font-bold text-gray-900">About this book</h2>
            <p className="mt-3 leading-relaxed text-gray-600">{book.description}</p>
          </section>

          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-serif text-2xl font-bold text-gray-900">Chapters</h2>
              <span className="text-sm text-gray-400">{chapters.length} episodes</span>
            </div>
            <ul className="space-y-2">
              {chapters.map((ch) => {
                const playable = unlocked || ch.is_preview;
                return (
                  <li
                    key={ch.id}
                    onClick={() => playable && handleListen()}
                    className={cn(
                      "group flex items-center gap-4 rounded-2xl border border-brand-100/60 bg-white p-3.5 shadow-soft transition-all",
                      playable ? "cursor-pointer hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-card" : "opacity-70"
                    )}
                  >
                    <span
                      className={cn(
                        "relative grid h-11 w-11 shrink-0 place-items-center rounded-full text-sm font-bold transition-colors",
                        playable ? "bg-brand-50 text-brand-700 group-hover:bg-green-grad group-hover:text-white" : "bg-gray-100 text-gray-400"
                      )}
                    >
                      {playable ? (
                        <>
                          <span className="transition-opacity group-hover:opacity-0">{ch.chapter_number}</span>
                          <Play className="absolute h-4 w-4 fill-current opacity-0 transition-opacity group-hover:opacity-100" />
                        </>
                      ) : (
                        <Lock className="h-4 w-4" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-gray-800">{ch.title}</p>
                      <p className="text-xs text-gray-400">{formatClock(ch.duration_seconds)}</p>
                    </div>
                    {ch.is_preview && !unlocked && (
                      <span className="rounded-full bg-gold-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-gold-600 ring-1 ring-gold-200">
                        Preview
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        </div>

        {/* author */}
        <aside className="lg:col-span-1">
          <div className="sticky top-24 overflow-hidden rounded-[1.75rem] bg-brand-900 p-6 text-white shadow-card">
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gold-400/20 blur-2xl" />
            <div className="relative">
              <h2 className="font-serif text-lg font-semibold">About the author</h2>
              <div className="mt-4 flex items-center gap-3">
                {author?.avatar_url && (
                  <Image src={author.avatar_url} alt={author.name} width={56} height={56} className="h-14 w-14 rounded-full object-cover ring-2 ring-gold-400/40" />
                )}
                <div>
                  <p className="font-semibold">{author?.name}</p>
                  <p className="text-xs text-brand-200">Author</p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-brand-100">{author?.bio}</p>
            </div>
          </div>
        </aside>
        </div>
      </div>

      {related.length > 0 && (
        <div className="mx-auto mt-14 max-w-[88rem]">
          <Carousel eyebrow="Keep exploring" title="Listeners also enjoyed" books={related} />
        </div>
      )}

      {toast && (
        <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full bg-brand-900 px-5 py-3 text-sm font-medium text-white shadow-xl md:bottom-8">
          {toast}
        </div>
      )}
    </div>
  );
}

function IconBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="grid h-12 w-12 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/20 backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/20"
    >
      {children}
    </button>
  );
}
