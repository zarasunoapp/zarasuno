"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Coins, Bell, Receipt, LogOut, Trash2, Check, Globe, MapPin, Save, Loader2, BookLock } from "lucide-react";
import { useStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import SignInPrompt from "@/components/SignInPrompt";
import Avatar from "@/components/Avatar";
import type { Category } from "@/lib/types";

type Lang = { code: string; name: string };
const TABS = ["Categories", "Wallet", "Notifications"] as const; // Wallet = purchases + unlocks
const COUNTRIES = ["PK", "IN", "US", "AE", "UK"];

export default function ProfilePage() {
  const router = useRouter();
  const { ready, signedIn, signOut, name, email, coins, country, languages, selectedCategories, setCountry, setLanguages, refresh } = useStore();
  const [tab, setTab] = useState<(typeof TABS)[number]>("Categories");
  const [categories, setCategories] = useState<Category[]>([]);
  const [langOptions, setLangOptions] = useState<Lang[]>([]);
  const [picked, setPicked] = useState<string[]>([]);
  const [pickedLangs, setPickedLangs] = useState<string[]>([]);
  const [txns, setTxns] = useState<any[]>([]);
  const [notifs, setNotifs] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // keep local edits in sync with the persisted state
  useEffect(() => setPicked(selectedCategories), [selectedCategories]);
  useEffect(() => setPickedLangs(languages), [languages]);

  useEffect(() => {
    if (!ready || !signedIn) return;
    const supabase = createClient();
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const [cats, langs, tx, nt] = await Promise.all([
        supabase.from("categories").select("*").eq("is_active", true).order("sort_order"),
        supabase.from("languages").select("code, name").eq("is_active", true).order("name"),
        user ? supabase.from("transactions").select("*, books(title)").eq("user_id", user.id).order("created_at", { ascending: false }) : Promise.resolve({ data: [] }),
        supabase.from("notifications").select("*").order("created_at", { ascending: false }),
      ]);
      setCategories((cats.data ?? []).map((c: any) => ({ id: c.id, name: c.name, slug: c.slug, icon: c.icon_url || "📚", sort_order: c.sort_order, is_active: c.is_active })));
      setLangOptions((langs.data ?? []) as Lang[]);
      setTxns(tx.data ?? []);
      setNotifs(nt.data ?? []);
    })();
  }, [ready, signedIn]);

  // local toggles only — nothing is persisted until "Save changes"
  const toggleCat = (id: string) => {
    setSaved(false);
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  };
  const toggleLang = (code: string) => {
    setSaved(false);
    setPickedLangs((p) => (p.includes(code) ? p.filter((x) => x !== code) : [...p, code]));
  };

  const sameSet = (a: string[], b: string[]) => a.length === b.length && a.every((x) => b.includes(x));
  const dirty = !sameSet(picked, selectedCategories) || !sameSet(pickedLangs, languages);
  const langNames = pickedLangs.map((c) => langOptions.find((l) => l.code === c)?.name ?? c).filter(Boolean);

  const save = async () => {
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // sync categories: clear then insert the current selection
      await supabase.from("user_categories").delete().eq("user_id", user.id);
      if (picked.length) await supabase.from("user_categories").insert(picked.map((category_id) => ({ user_id: user.id, category_id })));
    }
    await setLanguages(pickedLangs); // persists languages + preferred_language
    await refresh();                 // reload store so state matches
    setSaving(false);
    setSaved(true);
  };

  if (ready && !signedIn) {
    return <SignInPrompt title="Manage your account" message="Sign in to update your profile, view transactions, and more." />;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 pb-28 sm:px-6 md:pb-10">
      <div className="relative overflow-hidden rounded-3xl forest p-6 text-white shadow-card sm:p-8">
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-gold-400/25 blur-2xl" />
        <div className="relative flex flex-col items-center gap-5 sm:flex-row sm:items-center">
          <Avatar name={name || "Listener"} size={88} className="shrink-0 ring-4 ring-white/20" />
          <div className="flex-1 text-center sm:text-left">
            <h1 className="font-serif text-2xl font-semibold">{name || "Listener"}</h1>
            <p className="text-brand-100">{email}</p>
            <div className="mt-2 flex flex-wrap justify-center gap-2 sm:justify-start">
              <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-sm"><MapPin className="h-3.5 w-3.5" /> {country}</span>
              {langNames.length > 0 && (
                <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-sm"><Globe className="h-3.5 w-3.5" /> {langNames.join(", ")}</span>
              )}
            </div>
          </div>
          <div className="rounded-2xl bg-white/10 px-5 py-4 text-center">
            <div className="flex items-center gap-1.5"><Coins className="h-5 w-5 text-gold-300" /><span className="font-serif text-2xl font-semibold">{coins}</span></div>
            <p className="text-xs text-brand-100">coins</p>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-gray-100 p-5">
          <label className="text-sm font-medium text-gray-500">Country</label>
          <select value={country} onChange={(e) => setCountry(e.target.value)} className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-brand">
            {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="rounded-2xl border border-gray-100 p-5">
          <label className="text-sm font-medium text-gray-500">Preferred languages</label>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {langOptions.map((l) => {
              const active = pickedLangs.includes(l.code);
              return (
                <button
                  key={l.code}
                  onClick={() => toggleLang(l.code)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-semibold transition",
                    active ? "border-brand bg-brand-50 text-brand-700 ring-1 ring-brand" : "border-gray-200 text-gray-700 hover:border-brand-200"
                  )}
                >
                  {active && <Check className="h-3.5 w-3.5" />}
                  {l.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-8 flex gap-2 border-b border-gray-100">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={cn("border-b-2 px-4 py-3 text-sm font-medium transition", tab === t ? "border-brand text-brand-700" : "border-transparent text-gray-400 hover:text-gray-600")}>{t}</button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "Categories" && (
          <div>
            <p className="mb-4 text-sm text-gray-500">Tap to update the topics that power your recommendations.</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {categories.map((c) => {
                const active = picked.includes(c.id);
                return (
                  <button key={c.id} onClick={() => toggleCat(c.id)} className={cn("relative flex items-center gap-2 rounded-2xl border p-4 text-left transition", active ? "border-brand bg-brand-50" : "border-gray-200 hover:border-brand-200")}>
                    <span className="text-xl">{c.icon}</span>
                    <span className="text-sm font-medium text-gray-800">{c.name}</span>
                    {active && <span className="absolute right-2 top-2 grid h-5 w-5 place-items-center rounded-full bg-brand text-white"><Check className="h-3 w-3" /></span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {tab === "Wallet" && (
          <ul className="space-y-2">
            {txns.length === 0 && <li className="py-10 text-center text-gray-400">No wallet activity yet.</li>}
            {txns.map((t) => {
              const isUnlock = t.type === "spend" && t.books?.title;
              const label = isUnlock
                ? `Unlocked · ${t.books.title}`
                : t.type === "purchase" ? "Coins purchased"
                : t.type === "admin_grant" ? "Free coins"
                : t.type.replace("_", " ");
              return (
                <li key={t.id} className="flex items-center gap-4 rounded-2xl border border-gray-100 p-4">
                  <span className={cn("grid h-10 w-10 place-items-center rounded-full", t.coin_change > 0 ? "bg-brand-50 text-brand-600" : "bg-rose-50 text-rose-500")}>
                    {isUnlock ? <BookLock className="h-5 w-5" /> : <Receipt className="h-5 w-5" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium capitalize text-gray-900">{label}{t.amount ? ` · ${t.currency} ${Number(t.amount).toLocaleString()}` : ""}</p>
                    <p className="text-xs text-gray-400">{new Date(t.created_at).toLocaleDateString()} · <span className={cn("font-medium", t.payment_status === "pending" ? "text-gold-600" : "text-gray-400")}>{t.payment_status}</span></p>
                  </div>
                  <span className={cn("shrink-0 font-semibold", t.coin_change > 0 ? "text-brand-600" : "text-rose-500")}>{t.coin_change > 0 ? "+" : ""}{t.coin_change}</span>
                </li>
              );
            })}
          </ul>
        )}

        {tab === "Notifications" && (
          <ul className="space-y-2">
            {notifs.length === 0 && <li className="py-10 text-center text-gray-400">No notifications.</li>}
            {notifs.map((n) => (
              <li key={n.id} className={cn("flex gap-4 rounded-2xl border p-4", n.is_read ? "border-gray-100" : "border-brand-100 bg-brand-50/40")}>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-brand-600 shadow-soft"><Bell className="h-5 w-5" /></span>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{n.title}</p>
                  <p className="text-sm text-gray-500">{n.body}</p>
                  <p className="mt-1 text-xs text-gray-400">{new Date(n.created_at).toLocaleString()}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-10 flex flex-col gap-3 border-t border-gray-100 pt-6 sm:flex-row">
        <button onClick={async () => { await signOut(); window.location.href = "/"; }} className="flex items-center justify-center gap-2 rounded-full border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50">
          <LogOut className="h-4 w-4" /> Sign out
        </button>
        <button className="flex items-center justify-center gap-2 rounded-full border border-rose-200 px-6 py-3 text-sm font-semibold text-rose-500 hover:bg-rose-50">
          <Trash2 className="h-4 w-4" /> Delete account
        </button>
      </div>

      {/* Floating save bar — appears when categories/languages have unsaved edits */}
      {(dirty || saved) && (
        <div className="fixed inset-x-0 bottom-20 z-40 flex justify-center px-4 md:bottom-6">
          <div className="flex items-center gap-3 rounded-full bg-brand-900 py-2 pl-5 pr-2 text-white shadow-2xl ring-1 ring-white/10">
            <span className="text-sm font-medium">{!dirty && saved ? "All changes saved" : "You have unsaved changes"}</span>
            <button
              onClick={save}
              disabled={saving || !dirty}
              className="flex items-center gap-2 rounded-full bg-gold-400 px-5 py-2.5 text-sm font-semibold text-brand-900 transition enabled:hover:bg-gold-300 disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : !dirty && saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
              {saving ? "Saving…" : !dirty && saved ? "Saved" : "Save changes"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
