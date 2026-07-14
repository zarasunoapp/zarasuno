"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Bell, X, Sparkles, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type Notif = {
  id: string;
  user_id: string | null;
  title: string;
  body: string | null;
  image_url: string | null;
  audience: string | null;
  show_in_popup: boolean | null;
  link: string | null;
  created_at: string;
};

const SEEN_KEY = "zs_seen_notifs";

function loadSeen(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try { return new Set(JSON.parse(localStorage.getItem(SEEN_KEY) || "[]")); } catch { return new Set(); }
}
function saveSeen(ids: Set<string>) {
  try { localStorage.setItem(SEEN_KEY, JSON.stringify([...ids].slice(0, 200))); } catch {}
}

function timeAgo(iso: string) {
  const s = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return "just now";
  const m = Math.floor(s / 60); if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24); return d < 7 ? `${d}d ago` : new Date(iso).toLocaleDateString();
}

// show 'all' + 'non_subscribed' broadcasts to everyone; 'specific' arrives as a
// row targeted to this user (user_id match), which we already filter on.
function audienceOk(n: Notif) {
  return n.audience !== "specific" || !!n.user_id;
}

export default function NotificationBell({ light = false }: { light?: boolean }) {
  const router = useRouter();
  const supabase = useRef(createClient()).current;
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<Notif | null>(null);
  const [popup, setPopup] = useState<Notif | null>(null);

  useEffect(() => { setSeen(loadSeen()); }, []);

  useEffect(() => {
    let uid: string | null = null;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      uid = user?.id ?? null;

      // initial load — broadcasts + this user's own
      const filter = uid ? `user_id.is.null,user_id.eq.${uid}` : "user_id.is.null";
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .or(filter)
        .order("created_at", { ascending: false })
        .limit(20);
      setNotifs(((data ?? []) as Notif[]).filter(audienceOk));

      // live subscription
      channel = supabase
        .channel("realtime:notifications")
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications" }, (payload) => {
          const n = payload.new as Notif;
          if (n.user_id !== null && n.user_id !== uid) return; // not for me
          if (!audienceOk(n)) return;
          setNotifs((prev) => (prev.some((x) => x.id === n.id) ? prev : [n, ...prev]));
          setToast(n);
          setTimeout(() => setToast((t) => (t?.id === n.id ? null : t)), 5000);
          if (n.show_in_popup) setPopup(n);
        })
        .subscribe();
    })();

    return () => { if (channel) supabase.removeChannel(channel); };
  }, [supabase]);

  const unseenCount = notifs.filter((n) => !seen.has(n.id)).length;

  const openPanel = () => {
    setOpen(true);
    const next = new Set(seen);
    notifs.forEach((n) => next.add(n.id));
    setSeen(next);
    saveSeen(next);
  };

  // navigate to a notification's target (internal path → in-app, URL → new tab)
  const go = (n: Notif) => {
    if (!n.link) return;
    setOpen(false);
    setToast(null);
    setPopup(null);
    if (/^https?:\/\//i.test(n.link)) window.open(n.link, "_blank", "noopener");
    else router.push(n.link);
  };

  return (
    <>
      <button
        onClick={() => (open ? setOpen(false) : openPanel())}
        aria-label="Notifications"
        className={cn(
          "relative grid h-9 w-9 place-items-center rounded-full ring-1 transition",
          light ? "bg-white/10 text-white ring-white/15 hover:bg-white/20" : "bg-gray-100 text-gray-700 ring-black/5 hover:bg-gray-200"
        )}
      >
        <Bell className="h-[18px] w-[18px]" />
        {unseenCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white ring-2 ring-brand-900">
            {unseenCount > 9 ? "9+" : unseenCount}
          </span>
        )}
      </button>

      {/* dropdown / panel */}
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="fixed right-2 top-16 z-50 w-[22rem] max-w-[calc(100vw-1rem)] overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/10 sm:right-4">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
              <h3 className="flex items-center gap-2 font-serif text-lg font-semibold text-gray-900">
                <Bell className="h-4 w-4 text-brand-600" /> Notifications
              </h3>
              <button onClick={() => setOpen(false)} className="grid h-7 w-7 place-items-center rounded-full text-gray-400 hover:bg-gray-100">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="no-scrollbar max-h-[26rem] overflow-y-auto">
              {notifs.length === 0 ? (
                <p className="px-4 py-10 text-center text-sm text-gray-400">No notifications yet.</p>
              ) : (
                notifs.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => go(n)}
                    className={cn(
                      "flex items-center gap-3 border-b border-gray-50 px-4 py-3 last:border-0",
                      n.link ? "cursor-pointer hover:bg-brand-50/50" : "hover:bg-gray-50/60"
                    )}
                  >
                    {n.image_url ? (
                      <Image src={n.image_url} alt="" width={40} height={40} className="h-10 w-10 shrink-0 rounded-lg object-cover" />
                    ) : (
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600"><Sparkles className="h-5 w-5" /></span>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900">{n.title}</p>
                      {n.body && <p className="mt-0.5 text-sm text-gray-500">{n.body}</p>}
                      <p className="mt-1 text-xs text-gray-400">{timeAgo(n.created_at)}</p>
                    </div>
                    {n.link && <ChevronRight className="h-4 w-4 shrink-0 text-gray-300" />}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {/* live toast */}
      {toast && (
        <button
          onClick={() => (toast.link ? go(toast) : (setToast(null), openPanel()))}
          className="fixed bottom-24 left-1/2 z-[60] flex max-w-[92vw] -translate-x-1/2 items-center gap-3 rounded-2xl bg-brand-900 px-4 py-3 text-left text-white shadow-2xl ring-1 ring-white/10 md:bottom-8"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/10"><Bell className="h-4 w-4" /></span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold">{toast.title}</span>
            {toast.body && <span className="block truncate text-xs text-brand-100">{toast.body}</span>}
          </span>
          {toast.link && <ChevronRight className="h-4 w-4 shrink-0 text-brand-200" />}
        </button>
      )}

      {/* one-time popup */}
      {popup && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={() => setPopup(null)}>
          <div className="w-full max-w-sm animate-fade-up overflow-hidden rounded-3xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {popup.image_url && (
              <div className="relative aspect-[16/9] w-full bg-gray-100">
                <Image src={popup.image_url} alt="" fill sizes="384px" className="object-cover" />
              </div>
            )}
            <div className="p-6 text-center">
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-600"><Sparkles className="h-6 w-6" /></span>
              <h3 className="mt-3 font-serif text-xl font-semibold text-gray-900">{popup.title}</h3>
              {popup.body && <p className="mt-2 text-sm text-gray-500">{popup.body}</p>}
              {popup.link ? (
                <div className="mt-5 flex gap-2">
                  <button onClick={() => setPopup(null)} className="flex-1 rounded-full border border-gray-200 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50">Dismiss</button>
                  <button onClick={() => go(popup)} className="btn-green flex-1 rounded-full py-3 text-sm font-semibold">View</button>
                </div>
              ) : (
                <button onClick={() => setPopup(null)} className="btn-green mt-5 w-full rounded-full py-3 font-semibold">Got it</button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
