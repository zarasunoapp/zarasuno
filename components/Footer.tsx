"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Apple, Play, ArrowRight, Facebook, Instagram, MapPin, Sparkles, Leaf } from "lucide-react";
import Logo from "./Logo";

const CONTACT_LINKS = [
  { label: "ZaraSuno on Facebook", icon: Facebook, href: "#" },
  { label: "ZaraSuno on Instagram", icon: Instagram, href: "#" },
];

export default function Footer() {
  const pathname = usePathname();
  if (pathname?.endsWith("/listen") || pathname === "/login" || pathname === "/signup") return null;

  return (
    <footer className="pb-24 md:pb-0">
      {/* CTA photo band */}
      <div className="grain relative overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1600&q=80"
          alt="Library"
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-900 via-brand-900/88 to-brand-900/55" />
        <div className="absolute inset-0 bg-hero-mesh opacity-60" />
        <Leaf className="pointer-events-none absolute right-10 top-8 h-16 w-16 rotate-45 text-gold-300/20" />
        <div className="relative mx-auto flex max-w-[96rem] flex-col items-start gap-6 px-6 py-16 sm:px-10 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-gold-300">
              <Sparkles className="h-3.5 w-3.5" /> Join 50,000+ listeners
            </p>
            <h3 className="display mt-3 max-w-xl text-3xl text-white sm:text-4xl">
              Start your listening journey today
            </h3>
            <p className="mt-2 max-w-md text-brand-100">Get 50 free coins the moment you sign up — no card needed.</p>
          </div>
          <Link href="/signup" className="btn-gold flex shrink-0 items-center gap-2 rounded-full px-7 py-4 text-base font-semibold">
            Create free account <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* bottom bar */}
      <div className="forest text-brand-100">
        <div className="mx-auto grid max-w-[96rem] gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
          <div className="md:col-span-2">
            <Logo light />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-brand-100/80">
              The world&apos;s best books and summaries — in English and Urdu. Listen anywhere, unlock with coins, and grow a little every day.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <a href="#" className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-medium text-white ring-1 ring-white/15"><Apple className="h-5 w-5" /> App Store</a>
              <a href="#" className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-medium text-white ring-1 ring-white/15"><Play className="h-5 w-5" /> Google Play</a>
            </div>

            {/* social icons */}
            <div className="mt-6 flex items-center gap-3">
              {CONTACT_LINKS.map(({ label, icon: Icon, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/15 transition hover:-translate-y-0.5 hover:bg-gold-400 hover:text-brand-900"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>

            <p className="mt-5 flex items-center gap-2 text-sm text-brand-100/80">
              <MapPin className="h-4 w-4 shrink-0 text-gold-300" /> Sydney, Australia
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Explore</h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link href="/" className="hover:text-white">Home</Link></li>
              <li><Link href="/library" className="hover:text-white">Library</Link></li>
              <li><Link href="/coins" className="hover:text-white">Buy Coins</Link></li>
              <li><Link href="/profile" className="hover:text-white">Profile</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Company</h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link href="/faq" className="hover:text-white">FAQ</Link></li>
              <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="mx-auto max-w-[96rem] px-4 py-5 text-xs text-brand-100/70 sm:px-6">
            © {new Date().getFullYear()} ZaraSuno.app — All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
