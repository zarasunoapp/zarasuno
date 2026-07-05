"use client";

import { useState } from "react";
import { Download, X, Loader2, Check, Lock, ListMusic } from "lucide-react";
import type { Chapter } from "@/lib/types";
import { cn } from "@/lib/utils";

// Download unlocked/preview chapter audio for offline listening. Fetches a signed
// URL, then downloads the file as a blob (forces a real download, cross-origin).
export default function DownloadSheet({
  chapters,
  canDownload,
  onClose,
}: {
  chapters: Chapter[];
  canDownload: (i: number) => boolean;
  onClose: () => void;
}) {
  const [state, setState] = useState<Record<string, "idle" | "loading" | "done" | "error">>({});

  const download = async (ch: Chapter) => {
    setState((s) => ({ ...s, [ch.id]: "loading" }));
    try {
      const res = await fetch(`/api/audio?chapter=${ch.id}`);
      const data = await res.json();
      if (!data.url) throw new Error("no url");
      const file = await fetch(data.url);
      const blob = await file.blob();
      const objectUrl = URL.createObjectURL(blob);
      const ext = (data.url.split("?")[0].split(".").pop() || "mp3").slice(0, 4);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = `${ch.chapter_number}. ${ch.title}.${ext}`.replace(/[/\\?%*:|"<>]/g, "-");
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
      setState((s) => ({ ...s, [ch.id]: "done" }));
    } catch {
      setState((s) => ({ ...s, [ch.id]: "error" }));
    }
  };

  const downloadable = chapters.filter((_, i) => canDownload(i));

  const downloadAll = async () => {
    for (const ch of downloadable) {
      // eslint-disable-next-line no-await-in-loop
      await download(ch);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4" onClick={onClose}>
      <div className="max-h-[85vh] w-full max-w-md animate-fade-up overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="flex items-center gap-2 font-serif text-xl font-semibold text-gray-900">
              <Download className="h-5 w-5 text-brand-600" /> Download for offline
            </h3>
            <p className="mt-1 text-sm text-gray-500">Save chapters to your device.</p>
          </div>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full text-gray-400 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        {downloadable.length > 1 && (
          <button onClick={downloadAll} className="btn-green mb-3 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold">
            <ListMusic className="h-4 w-4" /> Download all ({downloadable.length})
          </button>
        )}

        <ul className="space-y-1.5">
          {chapters.map((ch, i) => {
            const ok = canDownload(i);
            const st = state[ch.id] ?? "idle";
            return (
              <li key={ch.id} className={cn("flex items-center gap-3 rounded-xl border border-gray-100 p-3", !ok && "opacity-60")}>
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-50 text-xs font-bold text-brand-700">
                  {ok ? ch.chapter_number : <Lock className="h-3.5 w-3.5 text-gray-400" />}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-800">{ch.title}</span>
                {ok ? (
                  <button
                    onClick={() => download(ch)}
                    disabled={st === "loading"}
                    className="grid h-9 w-9 place-items-center rounded-full bg-brand-50 text-brand-700 transition hover:bg-brand hover:text-white disabled:opacity-60"
                  >
                    {st === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : st === "done" ? <Check className="h-4 w-4" /> : <Download className="h-4 w-4" />}
                  </button>
                ) : (
                  <span className="text-[11px] font-semibold uppercase text-gray-400">Locked</span>
                )}
              </li>
            );
          })}
        </ul>

        <p className="mt-4 text-center text-xs text-gray-400">Only unlocked &amp; preview chapters can be downloaded.</p>
      </div>
    </div>
  );
}
