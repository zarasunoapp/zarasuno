"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, Lock, Play, Coins, Headphones, Lightbulb, Clock } from "lucide-react";
import type { Book } from "@/lib/types";
import { useStore } from "@/lib/store";
import { cn, formatDuration } from "@/lib/utils";

// Clean white card — cover, then title / author / short description, with the
// coin price + lock shown to the right of the title (not on the image).
export default function BookCard({ book, fluid = false }: { book: Book; index?: number; fluid?: boolean }) {
  const { isFavourite, toggleFavourite, isBookUnlocked, signedIn } = useStore();
  const fav = isFavourite(book.id);
  const unlocked = isBookUnlocked(book.id, book.is_free);
  const isSummary = book.book_type === "summary";

  return (
    <div className={cn(fluid ? "w-full sm:w-72 sm:shrink-0" : "w-64 shrink-0 sm:w-72")}>
      <div className="group overflow-hidden rounded-3xl bg-white p-3 shadow-card ring-1 ring-black/5 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-cardHover">
        <Link href={`/book/${book.id}`} className="block">
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-100">
            <Image
              src={book.cover_url}
              alt={book.title}
              fill
              sizes="240px"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

            {signedIn && (
              <button
                onClick={(e) => { e.preventDefault(); toggleFavourite(book.id); }}
                className="absolute right-2.5 top-2.5 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-gray-700 shadow backdrop-blur transition hover:scale-110"
                aria-label="Toggle favourite"
              >
                <Heart className={cn("h-4 w-4", fav && "fill-rose-500 text-rose-500")} />
              </button>
            )}

            <span className="absolute bottom-2.5 left-2.5 grid h-9 w-9 translate-y-2 place-items-center rounded-full bg-gold-grad text-brand-900 opacity-0 shadow-gold transition-all group-hover:translate-y-0 group-hover:opacity-100">
              <Play className="h-4 w-4 translate-x-0.5 fill-current" />
            </span>
          </div>
        </Link>

        <div className="px-1.5 pb-1 pt-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <Link href={`/book/${book.id}`}>
                <h3 className="line-clamp-1 text-[15px] font-bold text-gray-900 transition-colors group-hover:text-brand-700">{book.title}</h3>
              </Link>
              <p className="truncate text-xs font-semibold text-gray-700">{book.author_name}</p>
              {book.subtitle && (
                <p className="mt-0.5 truncate text-[11px] text-gray-500">{book.subtitle}</p>
              )}
            </div>

            {/* price + lock — to the right of the title */}
            <div className="flex shrink-0 flex-col items-end gap-1.5">
              {book.is_free ? (
                <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-bold uppercase text-brand-600">Free</span>
              ) : (
                <span className="flex items-center gap-0.5 text-sm font-extrabold text-brand-700">
                  <Coins className="h-3.5 w-3.5 text-gold-500" /> {book.coin_price}
                </span>
              )}
              {!unlocked && !book.is_free && <Lock className="h-3.5 w-3.5 text-gray-400" />}
            </div>
          </div>

          {/* type badge (Summary / Full Book) + duration */}
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            {isSummary ? (
              <span className="flex items-center gap-1 rounded-full bg-brand-50 px-2 py-1 text-[11px] font-bold text-brand-700 ring-1 ring-brand-100">
                <Lightbulb className="h-3.5 w-3.5" /> Summary
              </span>
            ) : (
              <span className="flex items-center gap-1 rounded-full bg-gold-100 px-2 py-1 text-[11px] font-bold text-gold-600 ring-1 ring-gold-200">
                <Headphones className="h-3.5 w-3.5" /> Full Book
              </span>
            )}
            {book.duration_seconds > 0 && (
              <span className="flex items-center gap-1 text-[11px] font-medium text-gray-500">
                <Clock className="h-3.5 w-3.5" /> {formatDuration(book.duration_seconds)}
              </span>
            )}
          </div>
        </div>

        <Link
          href={`/book/${book.id}`}
          className={cn(
            "mt-2 flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition",
            unlocked ? "bg-brand-900 text-white hover:bg-black" : "bg-gold-grad text-brand-900 shadow-gold"
          )}
        >
          {unlocked ? <><Play className="h-4 w-4 fill-current" /> Listen now</> : "Unlock now"}
        </Link>
      </div>
    </div>
  );
}
