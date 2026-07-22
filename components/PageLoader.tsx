"use client";

import { useEffect, useState } from "react";

// Branded loading indicator: the ZaraSuno book mark spins while a percentage
// counter races 1 → 100 underneath. Used in route-level loading.tsx files and
// wherever we wait on the backend.
export default function PageLoader({
  label,
  variant = "page",
}: {
  label?: string;
  variant?: "page" | "inline";
}) {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    let raf = 0;
    let p = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = now - last;
      last = now;
      // fast start, easing toward 100
      p += Math.max(0.6, (100 - p) * 0.05) * (dt / 16);
      if (p >= 100) p = 100;
      setPct(Math.round(p));
      if (p < 100) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className={variant === "page" ? "grid min-h-[60vh] w-full place-items-center px-6 py-16" : "grid w-full place-items-center px-6 py-12"}>
      <div className="flex flex-col items-center gap-4">
        <div className="relative grid place-items-center">
          {/* soft glow */}
          <span className="pointer-events-none absolute h-24 w-24 rounded-full bg-gold-400/25 blur-2xl" />
          {/* spinning book-play mark */}
          <svg viewBox="0 0 48 48" className="relative h-14 w-14 animate-spin [animation-duration:1.1s]" aria-hidden>
            <rect x="9" y="6" width="30" height="36" rx="7" fill="#D9A94C" />
            <path d="M31 6h5v12l-2.5-2.4L31 18z" fill="#BE8E30" />
            <path d="M20 17v14l11-7z" fill="#FFF7E8" />
          </svg>
        </div>
        <div className="font-serif text-2xl font-semibold tabular-nums text-brand-800">{pct}%</div>
        <p className="text-sm font-medium text-gray-400">{label ?? "Loading…"}</p>
      </div>
    </div>
  );
}
