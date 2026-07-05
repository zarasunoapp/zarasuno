"use client";

import { useEffect, useRef, useState } from "react";
import { Share2, Copy, Check, Facebook, Twitter, MessageCircle } from "lucide-react";

// Share the book's public URL to social media. Anyone who opens the link lands
// on the book page and unlocks it on their own account.
export default function ShareMenu({ bookId, title }: { bookId: string; title: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const url = typeof window !== "undefined" ? `${window.location.origin}/book/${bookId}` : "";
  const text = `Listen to "${title}" on ZaraSuno`;

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const nativeOrOpen = async () => {
    if (typeof navigator !== "undefined" && (navigator as any).share) {
      try {
        await (navigator as any).share({ title, text, url });
        return;
      } catch {}
    }
    setOpen((v) => !v);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const links = [
    { label: "Facebook", icon: Facebook, href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
    { label: "X (Twitter)", icon: Twitter, href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}` },
    { label: "WhatsApp", icon: MessageCircle, href: `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}` },
  ];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={nativeOrOpen}
        aria-label="Share"
        className="grid h-12 w-12 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/20 backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/20"
      >
        <Share2 className="h-5 w-5" />
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-2 w-56 overflow-hidden rounded-2xl bg-white p-2 text-gray-800 shadow-2xl ring-1 ring-black/5">
          <p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Share this book</p>
          {links.map(({ label, icon: Icon, href }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-brand-50"
            >
              <Icon className="h-4 w-4 text-brand-600" /> {label}
            </a>
          ))}
          <button onClick={copy} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-brand-50">
            {copied ? <Check className="h-4 w-4 text-brand-600" /> : <Copy className="h-4 w-4 text-brand-600" />}
            {copied ? "Link copied!" : "Copy link"}
          </button>
        </div>
      )}
    </div>
  );
}
