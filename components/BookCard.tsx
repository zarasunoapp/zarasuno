"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, Lock, Play, Coins, Headphones, Lightbulb, BookOpen, Clock } from "lucide-react";
import type { Book } from "@/lib/types";
import { useStore } from "@/lib/store";
import { cn, formatDuration } from "@/lib/utils";

// content-type badge (audiobook / summary / ebook), in the brand palette
const TYPE_BADGE = {
  summary: { label: "Summary", icon: Lightbulb, cls: "bg-brand-50 text-brand-700 ring-brand-100" },
  audiobook: { label: "Audiobook", icon: Headphones, cls: "bg-gold-100 text-gold-600 ring-gold-200" },
  ebook: { label: "eBook", icon: BookOpen, cls: "bg-clay-100 text-brand-900 ring-clay-200" },
} as const;

// Compact card — cover fills most of the tile, then title / author with the
// coin price + lock beside the title, and a content-type + duration badge row.
export default function BookCard({ book, fluid = false }: { book: Book; index?: number; fluid?: boolean }) {
  const { isFavourite, toggleFavourite, isBookUnlocked, signedIn, ready } = useStore();
  const fav = isFavourite(book.id);
  const unlocked = isBookUnlocked(book.id, book.is_free);
  const showLocked = ready && signedIn && !unlocked && !book.is_free;
  const badge = TYPE_BADGE[book.book_type as keyof typeof TYPE_BADGE] ?? TYPE_BADGE.audiobook;
  const BadgeIcon = badge.icon;

  return (
    <div className={cn("h-full", fluid ? "w-full sm:w-48 sm:shrink-0" : "w-44 shrink-0 sm:w-48")}>
      <div className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white p-1.5 shadow-card ring-1 ring-black/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-cardHover">
        <Link href={`/book/${book.id}`} className="block">
          <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-100">
            <Image
              src={book.cover_url}
              alt={book.title}
              fill
              sizes="180px"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

            {signedIn && (
              <button
                onClick={(e) => { e.preventDefault(); toggleFavourite(book.id); }}
                className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-white/90 text-gray-700 shadow backdrop-blur transition hover:scale-110"
                aria-label="Toggle favourite"
              >
                <Heart className={cn("h-3.5 w-3.5", fav && "fill-rose-500 text-rose-500")} />
              </button>
            )}

            {!signedIn && (
              <span className="absolute bottom-2 left-2 grid h-8 w-8 translate-y-2 place-items-center rounded-full bg-gold-grad text-brand-900 opacity-0 shadow-gold transition-all group-hover:translate-y-0 group-hover:opacity-100">
                <Play className="h-3.5 w-3.5 translate-x-0.5 fill-current" />
              </span>
            )}
          </div>
        </Link>

        <div className="px-1 pb-0.5 pt-2">
          <div className="flex items-start justify-between gap-1.5">
            <div className="min-w-0 flex-1">
              <Link href={`/book/${book.id}`}>
                <h3 className="line-clamp-2 min-h-[2.4rem] text-[15px] font-bold leading-tight text-gray-900 transition-colors group-hover:text-brand-700">{book.title}</h3>
              </Link>
              <p className="mt-0.5 truncate text-xs font-semibold text-gray-600">{book.author_name}</p>
            </div>

            {/* price + lock — beside the title */}
            <div className="flex shrink-0 flex-col items-end gap-1">
              {book.is_free ? (
                <span className="rounded-full bg-brand-50 px-1.5 py-0.5 text-[10px] font-bold uppercase text-brand-600">Free</span>
              ) : (
                <span className="flex items-center gap-0.5 text-[13px] font-extrabold text-brand-700">
                  <Coins className="h-3 w-3 text-gold-500" /> {book.coin_price}
                </span>
              )}
              {showLocked && <Lock className="h-3 w-3 text-gray-400" />}
            </div>
          </div>

          {/* content-type badge + duration */}
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <span className={cn("flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold ring-1", badge.cls)}>
              <BadgeIcon className="h-3 w-3" /> {badge.label}
            </span>
            {book.duration_seconds > 0 && (
              <span className="flex items-center gap-0.5 text-[10px] font-medium text-gray-500">
                <Clock className="h-3 w-3" /> {formatDuration(book.duration_seconds)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
