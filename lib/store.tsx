"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

// Client session backed by real Supabase auth + user tables.
// Catalog reads happen server-side (lib/queries.ts); this holds per-user state.

interface Store {
  ready: boolean;
  signedIn: boolean;
  onboarded: boolean;
  name: string;
  email: string;
  country: string;
  language: string;
  languages: string[];
  coins: number;
  favourites: string[];
  unlocked: string[];
  selectedCategories: string[];
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
  completeOnboarding: (categoryIds: string[], languageCodes: string[]) => Promise<void>;
  toggleFavourite: (bookId: string) => Promise<void>;
  isFavourite: (bookId: string) => boolean;
  isBookUnlocked: (bookId: string, isFree?: boolean) => boolean;
  unlockBook: (bookId: string) => Promise<{ ok: boolean; reason?: string }>;
  setCountry: (c: string) => Promise<void>;
  setLanguage: (l: string) => Promise<void>;
  setLanguages: (codes: string[]) => Promise<void>;
  addCoins: (n: number) => Promise<void>;
}

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({
  children,
  initialSignedIn = false,
}: {
  children: React.ReactNode;
  initialSignedIn?: boolean;
}) {
  const supabase = useRef(createClient()).current;
  const [ready, setReady] = useState(false);
  const [signedIn, setSignedIn] = useState(initialSignedIn);
  const [onboarded, setOnboarded] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountryState] = useState("PK");
  const [language, setLanguageState] = useState("en");
  const [languages, setLanguagesState] = useState<string[]>([]);
  const [coins, setCoins] = useState(0);
  const [favourites, setFavourites] = useState<string[]>([]);
  const [unlocked, setUnlocked] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setSignedIn(false);
      setReady(true);
      return;
    }
    setSignedIn(true);
    setEmail(user.email ?? "");

    const [profileRes, favRes, unlockRes, catRes, langRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
      supabase.from("favourites").select("book_id").eq("user_id", user.id),
      supabase.from("book_unlocks").select("book_id").eq("user_id", user.id),
      supabase.from("user_categories").select("category_id").eq("user_id", user.id),
      supabase.from("user_languages").select("language_code").eq("user_id", user.id),
    ]);

    const p = profileRes.data;
    if (p) {
      setName(p.full_name ?? "Listener");
      setEmail(p.email ?? user.email ?? "");
      setCountryState(p.country ?? "PK");
      setLanguageState(p.preferred_language ?? "en");
      setCoins(p.coin_balance ?? 0);
      setOnboarded(!!p.onboarding_completed);
    }
    setFavourites((favRes.data ?? []).map((r: any) => r.book_id));
    setUnlocked((unlockRes.data ?? []).map((r: any) => r.book_id));
    setSelectedCategories((catRes.data ?? []).map((r: any) => r.category_id));
    // fall back to the single preferred_language if user_languages is empty
    const langCodes = (langRes.data ?? []).map((r: any) => r.language_code);
    setLanguagesState(langCodes.length ? langCodes : (p?.preferred_language ? [p.preferred_language] : []));
    setReady(true);
  }, [supabase]);

  useEffect(() => {
    load();
    const { data: sub } = supabase.auth.onAuthStateChange(() => load());
    return () => sub.subscription.unsubscribe();
  }, [load, supabase]);

  const userId = useCallback(async () => {
    const { data } = await supabase.auth.getUser();
    return data.user?.id ?? null;
  }, [supabase]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setSignedIn(false);
    setFavourites([]);
    setUnlocked([]);
    setCoins(0);
  }, [supabase]);

  const completeOnboarding = useCallback(async (categoryIds: string[], languageCodes: string[]) => {
    const uid = await userId();
    if (!uid) return;
    await supabase.from("user_categories").upsert(categoryIds.map((category_id) => ({ user_id: uid, category_id })));
    await supabase.from("user_languages").delete().eq("user_id", uid);
    if (languageCodes.length) {
      await supabase.from("user_languages").insert(languageCodes.map((language_code) => ({ user_id: uid, language_code })));
    }
    await supabase.from("profiles").update({
      onboarding_completed: true,
      preferred_language: languageCodes[0] ?? "en",
    }).eq("id", uid);
    setSelectedCategories(categoryIds);
    setLanguagesState(languageCodes);
    setLanguageState(languageCodes[0] ?? "en");
    setOnboarded(true);
  }, [supabase, userId]);

  const toggleFavourite = useCallback(async (bookId: string) => {
    const uid = await userId();
    if (!uid) return;
    if (favourites.includes(bookId)) {
      setFavourites((f) => f.filter((id) => id !== bookId));
      await supabase.from("favourites").delete().eq("user_id", uid).eq("book_id", bookId);
    } else {
      setFavourites((f) => [...f, bookId]);
      await supabase.from("favourites").upsert({ user_id: uid, book_id: bookId });
    }
  }, [supabase, userId, favourites]);

  const isFavourite = useCallback((bookId: string) => favourites.includes(bookId), [favourites]);

  const isBookUnlocked = useCallback(
    (bookId: string, isFree?: boolean) => isFree === true || unlocked.includes(bookId),
    [unlocked]
  );

  const unlockBook = useCallback(async (bookId: string): Promise<{ ok: boolean; reason?: string }> => {
    const { data, error } = await supabase.rpc("unlock_book_with_coins", { p_book_id: bookId });
    if (error) return { ok: false, reason: "error" };
    const res = data as any;
    if (res?.success) {
      await load();
      return { ok: true };
    }
    return { ok: false, reason: res?.error ?? "error" };
  }, [supabase, load]);

  const setCountry = useCallback(async (c: string) => {
    setCountryState(c);
    const uid = await userId();
    if (uid) await supabase.from("profiles").update({ country: c }).eq("id", uid);
  }, [supabase, userId]);

  const setLanguage = useCallback(async (l: string) => {
    setLanguageState(l);
    const uid = await userId();
    if (uid) await supabase.from("profiles").update({ preferred_language: l }).eq("id", uid);
  }, [supabase, userId]);

  const setLanguages = useCallback(async (codes: string[]) => {
    setLanguagesState(codes);
    setLanguageState(codes[0] ?? "en");
    const uid = await userId();
    if (!uid) return;
    await supabase.from("user_languages").delete().eq("user_id", uid);
    if (codes.length) {
      await supabase.from("user_languages").insert(codes.map((language_code) => ({ user_id: uid, language_code })));
    }
    await supabase.from("profiles").update({ preferred_language: codes[0] ?? "en" }).eq("id", uid);
  }, [supabase, userId]);

  const addCoins = useCallback(async (n: number) => {
    const uid = await userId();
    if (!uid) return;
    setCoins((c) => c + n);
    await supabase.from("profiles").update({ coin_balance: coins + n }).eq("id", uid);
  }, [supabase, userId, coins]);

  const value: Store = {
    ready, signedIn, onboarded, name, email, country, language, languages, coins,
    favourites, unlocked, selectedCategories,
    refresh: load, signOut, completeOnboarding, toggleFavourite, isFavourite,
    isBookUnlocked, unlockBook, setCountry, setLanguage, setLanguages, addCoins,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
