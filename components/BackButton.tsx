"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

// Goes back to wherever the user came from (restoring their scroll position via
// the browser history) instead of a fixed link. Falls back to `fallback` when
// there is no history to go back to (e.g. opened in a fresh tab).
export default function BackButton({
  fallback = "/",
  label = "Back",
  className = "inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-2 text-sm font-semibold text-brand-700 shadow-soft ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-card",
}: {
  fallback?: string;
  label?: string;
  className?: string;
}) {
  const router = useRouter();
  return (
    <button
      onClick={() => {
        if (typeof window !== "undefined" && window.history.length > 1) router.back();
        else router.push(fallback);
      }}
      className={className}
    >
      <ChevronLeft className="h-4 w-4" /> {label}
    </button>
  );
}
