"use client";

import { useState } from "react";
import { Check, Sparkles } from "lucide-react";
import type { Category } from "@/lib/types";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function OnboardingModal({ categories }: { categories: Category[] }) {
  const { ready, signedIn, onboarded, completeOnboarding } = useStore();
  const [picked, setPicked] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  if (!ready || !signedIn || onboarded || categories.length === 0) return null;

  const toggle = (id: string) =>
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="w-full max-w-lg animate-fade-up rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl sm:p-8">
        <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
          <Sparkles className="h-3.5 w-3.5" /> Personalize your feed
        </span>
        <h2 className="mt-3 font-serif text-2xl font-semibold text-gray-900">
          What do you love to listen to?
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Pick a few favourites — we&apos;ll build your recommendations around them.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {categories.map((c) => {
            const active = picked.includes(c.id);
            return (
              <button
                key={c.id}
                onClick={() => toggle(c.id)}
                className={cn(
                  "relative flex flex-col items-start gap-2 rounded-2xl border p-4 text-left transition",
                  active
                    ? "border-brand bg-brand-50 ring-1 ring-brand"
                    : "border-gray-200 hover:border-brand-200"
                )}
              >
                <span className="text-2xl">{c.icon}</span>
                <span className="text-sm font-medium text-gray-800">{c.name}</span>
                {active && (
                  <span className="absolute right-2 top-2 grid h-5 w-5 place-items-center rounded-full bg-brand text-white">
                    <Check className="h-3 w-3" />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <button
          disabled={picked.length === 0 || saving}
          onClick={async () => {
            setSaving(true);
            await completeOnboarding(picked);
          }}
          className="mt-7 w-full rounded-full bg-brand py-3.5 text-base font-semibold text-white transition enabled:hover:bg-brand-600 disabled:opacity-40"
        >
          {saving ? "Saving…" : picked.length ? `Continue with ${picked.length} selected` : "Pick at least one"}
        </button>
      </div>
    </div>
  );
}
