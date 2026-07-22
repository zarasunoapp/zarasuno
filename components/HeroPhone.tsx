"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Play, Pause, SkipBack, SkipForward, Heart, ArrowRight } from "lucide-react";

const fmt = (s: number) => {
  if (!isFinite(s) || s < 0) s = 0;
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
};

// The phone in the hero — shows a real, admin-selected book with a playable
// ~1-minute audio sample and an "Explore this full book" link to /book/[id].
export default function HeroPhone({
  bookId,
  title,
  author,
  coverUrl,
  sampleUrl,
  sampleLabel = "Free 1-min sample",
}: {
  bookId?: string;
  title: string;
  author?: string | null;
  coverUrl: string;
  sampleUrl?: string | null;
  sampleLabel?: string;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [cur, setCur] = useState(0);
  const [dur, setDur] = useState(0);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onTime = () => setCur(a.currentTime);
    const onMeta = () => setDur(a.duration || 0);
    const onEnd = () => { setPlaying(false); setCur(0); };
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("loadedmetadata", onMeta);
    a.addEventListener("ended", onEnd);
    return () => {
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("loadedmetadata", onMeta);
      a.removeEventListener("ended", onEnd);
    };
  }, []);

  const toggle = () => {
    const a = audioRef.current;
    if (!a || !sampleUrl) return;
    if (playing) { a.pause(); setPlaying(false); }
    else { a.play().then(() => setPlaying(true)).catch(() => setPlaying(false)); }
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const a = audioRef.current;
    if (!a || !dur) return;
    const rect = e.currentTarget.getBoundingClientRect();
    a.currentTime = ((e.clientX - rect.left) / rect.width) * dur;
  };

  const pct = dur ? Math.min(100, (cur / dur) * 100) : 0;

  return (
    <div className="relative w-60 rotate-[-4deg] rounded-[2.75rem] bg-gradient-to-b from-brand-950 to-black p-2.5 shadow-2xl ring-1 ring-white/15 transition-transform duration-500 hover:rotate-0 sm:w-72">
      {sampleUrl && <audio ref={audioRef} src={sampleUrl} preload="metadata" />}

      <div className="relative overflow-hidden rounded-[2.25rem] bg-white p-4">
        <div className="mx-auto mb-4 h-1.5 w-16 rounded-full bg-gray-200" />

        {/* cover */}
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl shadow-lg ring-1 ring-black/5">
          <Image src={coverUrl} alt={title} fill priority sizes="288px" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <span className="absolute left-2.5 top-2.5 flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold text-brand-700 backdrop-blur">
            <span className="relative flex h-1.5 w-1.5">
              <span className={`absolute h-1.5 w-1.5 rounded-full bg-rose-500 ${playing ? "live-dot" : ""}`} />
            </span>
            {playing ? "Now playing" : sampleLabel}
          </span>
        </div>

        {/* title */}
        <div className="mt-4 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-serif text-lg font-semibold text-gray-900">{title}</p>
            <p className="truncate text-xs text-gray-400">{author}</p>
          </div>
          <Heart className="mt-1 h-5 w-5 shrink-0 fill-rose-500 text-rose-500" />
        </div>

        {/* progress (real) */}
        <div className="mt-4">
          <div onClick={seek} className="h-1.5 cursor-pointer overflow-hidden rounded-full bg-gray-100">
            <div className="h-full rounded-full bg-gold-grad transition-[width] duration-150" style={{ width: `${pct}%` }} />
          </div>
          <div className="mt-1.5 flex justify-between text-[10px] text-gray-400">
            <span>{fmt(cur)}</span>
            <span>{dur ? fmt(dur) : "1:00"}</span>
          </div>
        </div>

        {/* controls */}
        <div className="mt-4 flex items-center justify-center gap-6 text-brand-700">
          <SkipBack className="h-5 w-5 fill-current opacity-80" />
          <button
            onClick={toggle}
            disabled={!sampleUrl}
            aria-label={playing ? "Pause sample" : "Play sample"}
            className="grid h-14 w-14 place-items-center rounded-full bg-gold-grad text-brand-900 shadow-gold transition hover:scale-105 disabled:opacity-60"
          >
            {playing ? <Pause className="h-6 w-6 fill-current" /> : <Play className="h-6 w-6 translate-x-0.5 fill-current" />}
          </button>
          <SkipForward className="h-5 w-5 fill-current opacity-80" />
        </div>

        {/* explore full book */}
        {bookId ? (
          <Link
            href={`/book/${bookId}`}
            className="mt-4 flex items-center justify-center gap-1.5 rounded-2xl bg-brand-900 py-2.5 text-[13px] font-semibold text-white transition hover:bg-brand-800"
          >
            Explore this full book <ArrowRight className="h-4 w-4" />
          </Link>
        ) : (
          <div className="mt-4 flex items-center justify-center gap-1.5 rounded-2xl bg-brand-50 py-2.5 text-[11px] font-medium text-brand-700 ring-1 ring-brand-100">
            1.5× speed · English &amp; Urdu
          </div>
        )}
      </div>
    </div>
  );
}
