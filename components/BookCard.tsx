"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, Lock, Play, Star, Coins } from "lucide-react";
import type { Book } from "@/lib/types";
import { useStore } from "@/lib/store";
import { cn, formatCount } from "@/lib/utils";

// Clean white card with a beautiful soft shadow — used across every carousel.
export default function BookCard({ book }: { book: Book; index?: number }) {
  const { isFavourite, toggleFavourite, isBookUnlocked, signedIn } = useStore();
  const fav = isFavourite(book.id);
  const unlocked = isBookUnlocked(book.id, book.is_free);

  return (
    <div className="w-64 shrink-0 sm:w-72">
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

            {/* price badge */}
            <span className="absolute left-2.5 top-2.5 flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold text-brand-700 shadow-soft backdrop-blur">
              {book.is_free ? "FREE" : <><Coins className="h-3.5 w-3.5 text-gold-500" /> {book.coin_price}</>}
            </span>

            {signedIn && (
              <button
                onClick={(e) => { e.preventDefault(); toggleFavourite(book.id); }}
                className="absolute right-2.5 top-2.5 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-gray-700 shadow backdrop-blur transition hover:scale-110"
                aria-label="Toggle favourite"
              >
                <Heart className={cn("h-4 w-4", fav && "fill-rose-500 text-rose-500")} />
              </button>
            )}

            {!unlocked && !book.is_free && (
              <span className="absolute bottom-2.5 right-2.5 grid h-7 w-7 place-items-center rounded-full bg-black/45 text-white backdrop-blur">
                <Lock className="h-3.5 w-3.5" />
              </span>
            )}

            <span className="absolute bottom-2.5 left-2.5 grid h-9 w-9 translate-y-2 place-items-center rounded-full bg-gold-grad text-brand-900 opacity-0 shadow-gold transition-all group-hover:translate-y-0 group-hover:opacity-100">
              <Play className="h-4 w-4 translate-x-0.5 fill-current" />
            </span>
          </div>
        </Link>

        <div className="px-1.5 pb-1 pt-3">
          <p className="truncate text-[11px] font-medium text-gray-400">{book.author_name}</p>
          <Link href={`/book/${book.id}`}>
            <h3 className="line-clamp-1 text-[15px] font-bold text-gray-900 transition-colors group-hover:text-brand-700">{book.title}</h3>
          </Link>
          <div className="mt-1.5 flex items-center gap-1.5 text-xs">
            <span className="flex items-center gap-1 font-bold text-gray-700">
              <Star className="h-3.5 w-3.5 fill-gold-400 text-gold-400" /> {book.rating.toFixed(1)}
            </span>
            <span className="text-gray-300">·</span>
            <span className="text-gray-400">{formatCount(book.listen_count)} plays</span>
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
