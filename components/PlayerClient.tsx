"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Play, Pause, SkipBack, SkipForward, ChevronDown, Rewind, FastForward, ListMusic, Lock, Gauge, Loader2, AlertCircle,
} from "lucide-react";
import type { Author, Book, Chapter } from "@/lib/types";
import { useStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";
import { cn, formatClock } from "@/lib/utils";

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

export default function PlayerClient({
  book,
  author,
  chapters,
  initialIndex = 0,
}: {
  book: Book;
  author: Author | null;
  chapters: Chapter[];
  initialIndex?: number;
}) {
  const router = useRouter();
  const { ready, isBookUnlocked } = useStore();
  const unlocked = isBookUnlocked(book.id, book.is_free);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playingRef = useRef(false);
  const supabase = useRef(createClient()).current;
  const lastSaveRef = useRef(0);

  const [index, setIndex] = useState(initialIndex);
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [loading, setLoading] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [showChapters, setShowChapters] = useState(false);
  const [showSpeed, setShowSpeed] = useState(false);

  const chapter = chapters[index];
  const canPlay = (i: number) => unlocked || chapters[i]?.is_preview;

  // Guard: redirect if nothing is playable
  useEffect(() => {
    if (ready && !unlocked && !chapters.some((c) => c.is_preview)) {
      router.replace(`/book/${book.id}`);
    }
  }, [ready, unlocked, chapters, book.id, router]);

  // Load the signed URL for the current chapter and set it on the <audio>.
  useEffect(() => {
    const ch = chapters[index];
    if (!ch || !canPlay(index)) return;
    let cancelled = false;
    setLoading(true);
    setAudioError(null);
    setPosition(0);
    setDuration(ch.duration_seconds ?? 0);

    fetch(`/api/audio?chapter=${ch.id}`)
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        const audio = audioRef.current;
        if (d.url && audio) {
          audio.src = d.url;
          audio.playbackRate = speed;
          audio.load();
          if (playingRef.current) audio.play().catch(() => {});
        } else {
          setAudioError(
            d.error === "locked"
              ? "This chapter is locked — unlock the book to listen."
              : "Audio isn't available for this chapter yet."
          );
        }
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setAudioError("Couldn't load the audio. Please try again.");
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, unlocked]);

  // keep playbackRate in sync
  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = speed;
  }, [speed]);

  const goTo = (i: number, autoplay = false) => {
    if (i < 0 || i >= chapters.length || !canPlay(i)) return;
    if (autoplay) { playingRef.current = true; setPlaying(true); }
    setIndex(i);
  };
  const goNext = () => goTo(index + 1, playingRef.current);
  const goPrev = () => goTo(index - 1, playingRef.current);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio || audioError) return;
    if (audio.paused) {
      audio.play().catch(() => setAudioError("Tap play again to start audio."));
    } else {
      audio.pause();
    }
  };

  const seek = (v: number) => {
    if (audioRef.current) audioRef.current.currentTime = v;
    setPosition(v);
  };
  const nudge = (s: number) => seek(Math.max(0, Math.min(duration || 0, position + s)));

  // Persist listening progress (powers Library → History / In Progress).
  const saveProgress = async (pos: number, opts?: { completed?: boolean }) => {
    if (!unlocked) return; // only track real (unlocked/paid) listens
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const prior = chapters.slice(0, index).reduce((s, c) => s + (c.duration_seconds || 0), 0);
    const cumulative = Math.floor(prior + (pos || 0));
    const isLast = index === chapters.length - 1;
    const nearEnd = duration > 0 && pos >= duration - 5;
    const completed = opts?.completed ?? (isLast && nearEnd);
    await supabase.from("listening_progress").upsert(
      {
        user_id: user.id,
        book_id: book.id,
        chapter_id: chapter?.id ?? null,
        position_seconds: cumulative,
        is_completed: completed,
        last_listened_at: new Date().toISOString(),
      },
      { onConflict: "user_id,book_id" }
    );
  };

  // save on unmount (leaving the player)
  useEffect(() => {
    return () => {
      const a = audioRef.current;
      if (a && a.currentTime > 0) saveProgress(a.currentTime);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="grain fixed inset-0 z-50 flex flex-col overflow-y-auto bg-brand-900 text-white">
      {/* hero-matching background */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-900 via-brand-800 to-brand-900" />
      <div className="pointer-events-none absolute inset-0 bg-hero-mesh" />
      <div className="pointer-events-none absolute -left-32 top-0 h-[32rem] w-[32rem] rounded-full bg-brand-500/25 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-16 h-[26rem] w-[26rem] rounded-full bg-gold-400/15 blur-3xl" />

      {/* real audio element */}
      <audio
        ref={audioRef}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || chapter?.duration_seconds || 0)}
        onTimeUpdate={(e) => {
          const t = e.currentTarget.currentTime;
          setPosition(t);
          // throttle progress writes to ~every 12s of playback
          if (Date.now() - lastSaveRef.current > 12000) {
            lastSaveRef.current = Date.now();
            saveProgress(t);
          }
        }}
        onPlay={() => { playingRef.current = true; setPlaying(true); }}
        onPause={() => { playingRef.current = false; setPlaying(false); saveProgress(audioRef.current?.currentTime ?? position); }}
        onWaiting={() => setBuffering(true)}
        onPlaying={() => setBuffering(false)}
        onCanPlay={() => setBuffering(false)}
        onEnded={() => { saveProgress(duration, { completed: index === chapters.length - 1 }); goNext(); }}
        onError={() => { setAudioError("Audio isn't available for this chapter yet."); setLoading(false); setBuffering(false); }}
        preload="metadata"
      />

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-5 py-4">
        <button onClick={() => router.push(`/book/${book.id}`)} className="grid h-10 w-10 place-items-center rounded-full bg-white/10 hover:bg-white/20">
          <ChevronDown className="h-5 w-5" />
        </button>
        <p className="text-sm font-medium text-brand-100">Now Playing</p>
        <button onClick={() => setShowChapters(true)} className="grid h-10 w-10 place-items-center rounded-full bg-white/10 hover:bg-white/20">
          <ListMusic className="h-5 w-5" />
        </button>
      </div>

      {/* Cover */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6">
        <div className="relative aspect-square w-full max-w-xs overflow-hidden rounded-3xl shadow-2xl ring-1 ring-white/10">
          <Image src={book.cover_url} alt={book.title} fill sizes="320px" className="object-cover" priority />
          {(loading || buffering) && (
            <div className="absolute inset-0 grid place-items-center gap-2 bg-black/40 backdrop-blur-sm">
              <Loader2 className="h-9 w-9 animate-spin text-gold-300" />
              <span className="text-xs font-medium text-white/90">{loading ? "Loading…" : "Buffering…"}</span>
            </div>
          )}
        </div>

        <div className="mt-8 w-full max-w-md text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-gold-300">
            Chapter {chapter?.chapter_number} of {chapters.length}
          </p>
          <h1 className="mt-1 font-serif text-2xl font-semibold">{chapter?.title}</h1>
          <p className="mt-1 text-brand-100">{book.title} · {author?.name}</p>

          {audioError && (
            <p className="mx-auto mt-4 flex max-w-sm items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm text-gold-200">
              <AlertCircle className="h-4 w-4 shrink-0" /> {audioError}
            </p>
          )}

          {/* Seek bar */}
          <div className="mt-8">
            <input
              type="range"
              min={0}
              max={duration || 1}
              value={position}
              onChange={(e) => seek(Number(e.target.value))}
              className="player-range w-full"
              style={{ background: `linear-gradient(to right, #D9A94C ${(position / (duration || 1)) * 100}%, rgba(255,255,255,0.2) ${(position / (duration || 1)) * 100}%)` }}
            />
            <div className="mt-1.5 flex justify-between text-xs text-brand-100">
              <span>{formatClock(position)}</span>
              <span>{formatClock(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="mt-6 flex items-center justify-center gap-6">
            <button onClick={() => nudge(-15)} className="grid h-11 w-11 place-items-center rounded-full text-white/80 hover:text-white">
              <Rewind className="h-6 w-6" />
            </button>
            <button onClick={goPrev} disabled={index === 0} className="grid h-12 w-12 place-items-center rounded-full text-white/80 hover:text-white disabled:opacity-30">
              <SkipBack className="h-7 w-7 fill-current" />
            </button>
            <button
              onClick={togglePlay}
              disabled={loading || !!audioError}
              className="grid place-items-center rounded-full bg-gold-400 text-brand-800 shadow-xl transition hover:bg-gold-300 disabled:opacity-50"
              style={{ height: "4.5rem", width: "4.5rem" }}
            >
              {loading || buffering ? <Loader2 className="h-8 w-8 animate-spin" /> : playing ? <Pause className="h-8 w-8 fill-current" /> : <Play className="h-8 w-8 translate-x-0.5 fill-current" />}
            </button>
            <button onClick={goNext} disabled={index === chapters.length - 1 || !canPlay(index + 1)} className="grid h-12 w-12 place-items-center rounded-full text-white/80 hover:text-white disabled:opacity-30">
              <SkipForward className="h-7 w-7 fill-current" />
            </button>
            <button onClick={() => nudge(15)} className="grid h-11 w-11 place-items-center rounded-full text-white/80 hover:text-white">
              <FastForward className="h-6 w-6" />
            </button>
          </div>

          {/* Speed */}
          <div className="relative mt-8 flex justify-center">
            <button onClick={() => setShowSpeed((v) => !v)} className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium hover:bg-white/20">
              <Gauge className="h-4 w-4" /> {speed}× speed
            </button>
            {showSpeed && (
              <div className="absolute bottom-12 flex gap-1 rounded-2xl bg-white p-2 shadow-xl">
                {SPEEDS.map((s) => (
                  <button key={s} onClick={() => { setSpeed(s); setShowSpeed(false); }} className={cn("rounded-lg px-2.5 py-1.5 text-sm font-medium", s === speed ? "bg-brand text-white" : "text-gray-600 hover:bg-gray-100")}>
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
          <div className="max-h-[70vh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 text-gray-900" onClick={(e) => e.stopPropagation()}>
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-gray-200" />
            <h3 className="font-serif text-lg font-semibold">Chapters</h3>
            <ul className="mt-3 space-y-1">
              {chapters.map((ch, i) => {
                const playable = canPlay(i);
                return (
                  <li key={ch.id}>
                    <button
                      onClick={() => { if (playable) { goTo(i, true); setShowChapters(false); } }}
                      className={cn("flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left", i === index ? "bg-brand-50" : "hover:bg-gray-50", !playable && "opacity-50")}
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
