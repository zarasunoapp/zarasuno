"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Home, Library, User, Coins, Menu, X, LogIn, Search } from "lucide-react";
import Logo from "./Logo";
import NotificationBell from "./NotificationBell";
import SearchBar from "./SearchBar";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Home", icon: Home },
  { href: "/library", label: "Library", icon: Library },
  { href: "/coins", label: "Coins", icon: Coins },
];

// bottom mobile tabs (signed-in) — Coins replaced with Explore (search)
const BOTTOM_TABS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/explore", label: "Explore", icon: Search },
  { href: "/library", label: "Library", icon: Library },
  { href: "/profile", label: "Profile", icon: User },
];

export default function Navbar() {
  const pathname = usePathname();
  const { signedIn, coins } = useStore();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // lock scroll when the drawer is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (pathname?.endsWith("/listen") || pathname === "/login" || pathname === "/signup" || pathname === "/reset-password") return null;

  const navItems = [...NAV, { href: "/profile", label: "Profile", icon: User }];

  return (
    <>
      <header className="sticky top-0 z-40 px-3 pt-3 sm:px-4 sm:pt-4">
        <div
          className={cn(
            "mx-auto flex h-14 max-w-[96rem] items-center justify-between rounded-2xl border border-white/10 px-3 pr-2 transition-all sm:h-16 sm:px-5",
            scrolled ? "bg-brand-900/95 shadow-lg backdrop-blur-xl" : "bg-brand-900/85 shadow-md backdrop-blur-xl"
          )}
        >
          <Logo light />

          {/* center nav — white pills, green text/icons */}
          <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-2 md:flex">
            {NAV.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-brand-700 transition",
                    active
                      ? "bg-white shadow-md ring-2 ring-brand-500/50"
                      : "bg-white/90 shadow-soft hover:-translate-y-0.5 hover:bg-white hover:shadow-md"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <SearchBar />
            {signedIn ? (
              <>
                <NotificationBell light />
                <Link href="/coins" className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-sm font-bold text-gold-300 ring-1 ring-white/15 transition hover:bg-white/20">
                  <Coins className="h-4 w-4" />
                  {coins}
                </Link>
                <Link href="/profile" className="hidden h-9 w-9 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/15 transition hover:bg-white/20 md:grid">
                  <User className="h-5 w-5" />
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" className="hidden rounded-full px-4 py-2 text-sm font-semibold text-white/85 transition hover:bg-white/10 sm:block">
                  Sign in
                </Link>
                <Link href="/signup" className="btn-sweep hidden rounded-full bg-gold-400 px-5 py-2.5 text-sm font-semibold text-brand-900 shadow-soft sm:block">
                  Start Listening Free
                </Link>
              </>
            )}

            <button onClick={() => setOpen(true)} className="grid h-9 w-9 place-items-center rounded-full text-white transition hover:bg-white/10 md:hidden">
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* ===== Mobile sidebar drawer ===== */}
      {/* backdrop */}
      <div
        onClick={() => setOpen(false)}
        className={cn(
          "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-300 md:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      />
      {/* panel — slides in from the right */}
      <aside
        className={cn(
          "fixed right-0 top-0 z-50 flex h-full w-72 max-w-[82%] flex-col bg-brand-900 p-6 shadow-2xl transition-transform duration-300 ease-out md:hidden",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="mb-8 flex items-center justify-between">
          <Logo light />
          <button onClick={() => setOpen(false)} className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex flex-col gap-1.5">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-brand-700 transition",
                  active ? "bg-white shadow ring-2 ring-brand-500/50" : "bg-white/90 hover:bg-white"
                )}
              >
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-2 border-t border-white/10 pt-5">
          {signedIn ? (
            <Link href="/coins" onClick={() => setOpen(false)} className="flex items-center justify-center gap-2 rounded-xl bg-white/10 py-3 text-sm font-bold text-gold-300">
              <Coins className="h-4 w-4" /> {coins} coins
            </Link>
          ) : (
            <>
              <Link href="/login" onClick={() => setOpen(false)} className="flex items-center justify-center gap-2 rounded-xl bg-white/10 py-3 text-sm font-semibold text-white">
                <LogIn className="h-4 w-4" /> Sign in
              </Link>
              <Link href="/signup" onClick={() => setOpen(false)} className="flex items-center justify-center gap-2 rounded-xl bg-gold-400 py-3 text-sm font-semibold text-brand-900">
                Start Listening Free
              </Link>
            </>
          )}
        </div>
      </aside>

      {/* Mobile bottom tab bar — only for signed-in users */}
      {signedIn && (
        <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-white/10 bg-brand-900/95 backdrop-blur md:hidden">
          <div className="grid grid-cols-4">
            {BOTTOM_TABS.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link key={href} href={href} className={cn("flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold", active ? "text-gold-300" : "text-white/55")}>
                  <Icon className="h-5 w-5" />
                  {label}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </>
  );
}
