"use client";

import { useEffect, useState } from "react";
import { Check, Sparkles, Globe, ChevronLeft } from "lucide-react";
import type { Category } from "@/lib/types";
import { useStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type Lang = { code: string; name: string };

export default function OnboardingModal({ categories }: { categories: Category[] }) {
  const { ready, signedIn, onboarded, completeOnboarding } = useStore();
  const [step, setStep] = useState<"categories" | "languages">("categories");
  const [picked, setPicked] = useState<string[]>([]);
  const [langs, setLangs] = useState<Lang[]>([]);
  const [pickedLangs, setPickedLangs] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // load available languages once the modal is eligible to show
  useEffect(() => {
    if (!signedIn) return;
    const supabase = createClient();
    supabase
      .from("languages")
      .select("code, name")
      .eq("is_active", true)
      .order("name")
      .then(({ data }) => data && setLangs(data as Lang[]));
  }, [signedIn]);

  if (!ready || !signedIn || onboarded || categories.length === 0) return null;

  const toggle = (id: string) =>
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  const toggleLang = (code: string) =>
    setPickedLangs((p) => (p.includes(code) ? p.filter((x) => x !== code) : [...p, code]));

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="w-full max-w-lg animate-fade-up rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl sm:p-8">
        {/* step indicator */}
        <div className="mb-4 flex items-center gap-1.5">
          <span className={cn("h-1.5 flex-1 rounded-full", "bg-brand")} />
          <span className={cn("h-1.5 flex-1 rounded-full", step === "languages" ? "bg-brand" : "bg-gray-200")} />
        </div>

        {step === "categories" ? (
          <>
            <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
              <Sparkles className="h-3.5 w-3.5" /> Personalize your feed
            </span>
            <h2 className="mt-3 font-serif text-2xl font-semibold text-gray-900">What do you love to listen to?</h2>
            <p className="mt-1 text-sm text-gray-500">Pick a few favourites — we&apos;ll build your recommendations around them.</p>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {categories.map((c) => {
                const active = picked.includes(c.id);
                return (
                  <button
                    key={c.id}
                    onClick={() => toggle(c.id)}
                    className={cn(
                      "relative flex flex-col items-start gap-2 rounded-2xl border p-4 text-left transition",
                      active ? "border-brand bg-brand-50 ring-1 ring-brand" : "border-gray-200 hover:border-brand-200"
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
              disabled={picked.length === 0}
              onClick={() => setStep("languages")}
              className="mt-7 w-full rounded-full bg-brand py-3.5 text-base font-semibold text-white transition enabled:hover:bg-brand-600 disabled:opacity-40"
            >
              {picked.length ? `Continue with ${picked.length} selected` : "Pick at least one"}
            </button>
          </>
        ) : (
          <>
            <button onClick={() => setStep("categories")} className="mb-3 flex items-center gap-1 text-sm font-semibold text-brand-700 hover:text-brand-600">
              <ChevronLeft className="h-4 w-4" /> Back
            </button>
            <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
              <Globe className="h-3.5 w-3.5" /> Choose your languages
            </span>
            <h2 className="mt-3 font-serif text-2xl font-semibold text-gray-900">Which languages do you listen in?</h2>
            <p className="mt-1 text-sm text-gray-500">Select one or more — you can change these anytime in your profile.</p>

            <div className="mt-6 flex flex-wrap gap-2.5">
              {langs.map((l) => {
                const active = pickedLangs.includes(l.code);
                return (
                  <button
                    key={l.code}
                    onClick={() => toggleLang(l.code)}
                    className={cn(
                      "flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition",
                      active ? "border-brand bg-brand-50 text-brand-700 ring-1 ring-brand" : "border-gray-200 text-gray-700 hover:border-brand-200"
                    )}
                  >
                    {active && <Check className="h-3.5 w-3.5" />}
                    {l.name}
                  </button>
                );
              })}
            </div>

            <button
              disabled={pickedLangs.length === 0 || saving}
              onClick={async () => {
                setSaving(true);
                await completeOnboarding(picked, pickedLangs);
              }}
              className="mt-8 w-full rounded-full bg-brand py-3.5 text-base font-semibold text-white transition enabled:hover:bg-brand-600 disabled:opacity-40"
            >
              {saving ? "Saving…" : pickedLangs.length ? `Finish · ${pickedLangs.length} language${pickedLangs.length > 1 ? "s" : ""}` : "Pick at least one"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
