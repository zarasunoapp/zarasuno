"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Play, Pause, SkipBack, SkipForward, ChevronDown, Rewind, FastForward, ListMusic, Lock, Gauge,
} from "lucide-react";
import type { Author, Book, Chapter } from "@/lib/types";
import { useStore } from "@/lib/store";
import { cn, formatClock } from "@/lib/utils";

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

export default function PlayerClient({
  book,
  author,
  chapters,
}: {
  book: Book;
  author: Author | null;
  chapters: Chapter[];
}) {
  const router = useRouter();
  const { ready, isBookUnlocked } = useStore();
  const unlocked = isBookUnlocked(book.id, book.is_free);

  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [showChapters, setShowChapters] = useState(false);
  const [showSpeed, setShowSpeed] = useState(false);
  const tick = useRef<ReturnType<typeof setInterval> | null>(null);

  const chapter = chapters[index];
  const duration = chapter?.duration_seconds ?? 0;

  // Guard: unlocked-only. Chapters that are previews stay playable while locked.
  useEffect(() => {
    if (ready && !unlocked && !chapters.some((c) => c.is_preview)) {
      router.replace(`/book/${book.id}`);
    }
  }, [ready, unlocked, chapters, book.id, router]);

  // Simulated playback clock. Real player would drive this from <audio> timeupdate,
  // sourcing a signed URL from the get-audio-url edge function per chapter.
  useEffect(() => {
    if (playing) {
      tick.current = setInterval(() => {
        setPosition((p) => {
          if (p + speed >= duration) {
            goNext();
            return 0;
          }
          return p + speed;
        });
      }, 1000);
    }
    return () => {
      if (tick.current) clearInterval(tick.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, speed, duration, index]);

  const canPlay = (i: number) => unlocked || chapters[i]?.is_preview;

  const goTo = (i: number) => {
    if (i < 0 || i >= chapters.length) return;
    if (!canPlay(i)) return;
    setIndex(i);
    setPosition(0);
    // increment_listen_count(book.id) would fire here when the chapter starts.
  };
  const goNext = () => goTo(Math.min(index + 1, chapters.length - 1));
  const goPrev = () => goTo(Math.max(index - 1, 0));
  const seek = (v: number) => setPosition(v);

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-gradient-to-b from-brand-800 via-brand-700 to-brand-900 text-white">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-4">
        <button
          onClick={() => router.push(`/book/${book.id}`)}
          className="grid h-10 w-10 place-items-center rounded-full bg-white/10 hover:bg-white/20"
        >
          <ChevronDown className="h-5 w-5" />
        </button>
        <p className="text-sm font-medium text-brand-100">Now Playing</p>
        <button
          onClick={() => setShowChapters(true)}
          className="grid h-10 w-10 place-items-center rounded-full bg-white/10 hover:bg-white/20"
        >
          <ListMusic className="h-5 w-5" />
        </button>
      </div>

      {/* Cover */}
      <div className="flex flex-1 flex-col items-center justify-center px-6">
        <div className="relative aspect-square w-full max-w-xs overflow-hidden rounded-3xl shadow-2xl ring-1 ring-white/10">
          <Image src={book.cover_url} alt={book.title} fill sizes="320px" className="object-cover" priority />
        </div>

        <div className="mt-8 w-full max-w-md text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-gold-300">
            Chapter {chapter?.chapter_number} of {chapters.length}
          </p>
          <h1 className="mt-1 font-serif text-2xl font-semibold">{chapter?.title}</h1>
          <p className="mt-1 text-brand-100">
            {book.title} · {author?.name}
          </p>

          {/* Seek bar */}
          <div className="mt-8">
            <input
              type="range"
              min={0}
              max={duration || 1}
              value={position}
              onChange={(e) => seek(Number(e.target.value))}
              className="player-range w-full"
              style={{
                background: `linear-gradient(to right, #E0B84C ${(position / (duration || 1)) * 100}%, rgba(255,255,255,0.2) ${(position / (duration || 1)) * 100}%)`,
              }}
            />
            <div className="mt-1.5 flex justify-between text-xs text-brand-100">
              <span>{formatClock(position)}</span>
              <span>{formatClock(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="mt-6 flex items-center justify-center gap-6">
            <button
              onClick={() => seek(Math.max(0, position - 15))}
              className="grid h-11 w-11 place-items-center rounded-full text-white/80 hover:text-white"
            >
              <Rewind className="h-6 w-6" />
            </button>
            <button
              onClick={goPrev}
              disabled={index === 0}
              className="grid h-12 w-12 place-items-center rounded-full text-white/80 hover:text-white disabled:opacity-30"
            >
              <SkipBack className="h-7 w-7 fill-current" />
            </button>
            <button
              onClick={() => setPlaying((p) => !p)}
              className="grid h-18 w-18 place-items-center rounded-full bg-gold-400 text-brand-800 shadow-xl transition hover:bg-gold-300"
              style={{ height: "4.5rem", width: "4.5rem" }}
            >
              {playing ? <Pause className="h-8 w-8 fill-current" /> : <Play className="h-8 w-8 translate-x-0.5 fill-current" />}
            </button>
            <button
              onClick={goNext}
              disabled={index === chapters.length - 1 || !canPlay(index + 1)}
              className="grid h-12 w-12 place-items-center rounded-full text-white/80 hover:text-white disabled:opacity-30"
            >
              <SkipForward className="h-7 w-7 fill-current" />
            </button>
            <button
              onClick={() => seek(Math.min(duration, position + 15))}
              className="grid h-11 w-11 place-items-center rounded-full text-white/80 hover:text-white"
            >
              <FastForward className="h-6 w-6" />
            </button>
          </div>

          {/* Speed */}
          <div className="relative mt-8 flex justify-center">
            <button
              onClick={() => setShowSpeed((v) => !v)}
              className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium hover:bg-white/20"
            >
              <Gauge className="h-4 w-4" /> {speed}× speed
            </button>
            {showSpeed && (
              <div className="absolute bottom-12 flex gap-1 rounded-2xl bg-white p-2 shadow-xl">
                {SPEEDS.map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setSpeed(s);
                      setShowSpeed(false);
                    }}
                    className={cn(
                      "rounded-lg px-2.5 py-1.5 text-sm font-medium",
                      s === speed ? "bg-brand text-white" : "text-gray-600 hover:bg-gray-100"
                    )}
                  >
                    {s}×
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="h-8" />

      {/* Chapter sheet */}
      {showChapters && (
        <div className="fixed inset-0 z-10 flex items-end bg-black/50" onClick={() => setShowChapters(false)}>
          <div
            className="max-h-[70vh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 text-gray-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-gray-200" />
            <h3 className="font-serif text-lg font-semibold">Chapters</h3>
            <ul className="mt-3 space-y-1">
              {chapters.map((ch, i) => {
                const playable = canPlay(i);
                return (
                  <li key={ch.id}>
                    <button
                      onClick={() => {
                        if (playable) {
                          goTo(i);
                          setShowChapters(false);
                          setPlaying(true);
                        }
                      }}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left",
                        i === index ? "bg-brand-50" : "hover:bg-gray-50",
                        !playable && "opacity-50"
                      )}
                    >
                      <span className="grid h-8 w-8 place-items-center rounded-full bg-gray-100 text-xs font-semibold text-gray-500">
                        {playable ? ch.chapter_number : <Lock className="h-3.5 w-3.5" />}
                      </span>
                      <span className="flex-1 truncate text-sm font-medium">{ch.title}</span>
                      <span className="text-xs text-gray-400">{formatClock(ch.duration_seconds)}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
