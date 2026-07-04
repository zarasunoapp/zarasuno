"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Home, Library, User, Coins, Menu, X } from "lucide-react";
import Logo from "./Logo";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Home", icon: Home },
  { href: "/library", label: "Library", icon: Library },
  { href: "/coins", label: "Coins", icon: Coins },
];

export default function Navbar() {
  const pathname = usePathname();
  const { signedIn, coins, ready } = useStore();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (pathname?.endsWith("/listen") || pathname === "/login" || pathname === "/signup") return null;

  return (
    <>
      <header className="sticky top-0 z-50 px-3 pt-3 sm:px-4 sm:pt-4">
        <div
          className={cn(
            "mx-auto flex h-14 max-w-7xl items-center justify-between rounded-2xl border border-white/10 px-3 pr-2 transition-all sm:h-16 sm:px-5",
            scrolled
              ? "bg-brand-900/95 shadow-lg backdrop-blur-xl"
              : "bg-brand-900/85 shadow-md backdrop-blur-xl"
          )}
        >
          <Logo light />

          {/* center nav pill */}
          <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 rounded-full bg-white/10 p-1 md:flex">
            {NAV.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    active ? "bg-gold-400 text-brand-900" : "text-white/80 hover:text-white"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            {ready && signedIn ? (
              <>
                <Link href="/coins" className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-sm font-semibold text-gold-300 ring-1 ring-white/15 hover:bg-white/20">
                  <Coins className="h-4 w-4" />
                  {coins}
                </Link>
                <Link href="/profile" className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/15 hover:bg-white/20">
                  <User className="h-5 w-5" />
                </Link>
              </>
            ) : (
              <div className={cn("flex items-center gap-1.5 transition-opacity sm:gap-2", !ready && "pointer-events-none opacity-0")}>
                <Link href="/login" className="hidden rounded-full px-4 py-2 text-sm font-semibold text-white/85 hover:bg-white/10 sm:block">
                  Sign in
                </Link>
                <Link href="/signup" className="rounded-full bg-gold-400 px-4 py-2.5 text-sm font-semibold text-brand-900 shadow-soft transition hover:bg-gold-300">
                  Get started
                </Link>
              </div>
            )}

            <button onClick={() => setOpen((v) => !v)} className="rounded-full p-2 text-white hover:bg-white/10 md:hidden">
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {open && (
          <nav className="mx-auto mt-2 max-w-7xl rounded-2xl border border-white/10 bg-brand-900 p-2 shadow-lg md:hidden">
            {[...NAV, { href: "/profile", label: "Profile", icon: User }].map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium",
                  pathname === href ? "bg-gold-400 text-brand-900" : "text-white/80 hover:bg-white/10"
                )}
              >
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            ))}
          </nav>
        )}
      </header>

      {/* Mobile bottom tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-brand-900/95 backdrop-blur md:hidden">
        <div className="grid grid-cols-4">
          {[...NAV, { href: "/profile", label: "Profile", icon: User }].map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href} className={cn("flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium", active ? "text-gold-300" : "text-white/55")}>
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
