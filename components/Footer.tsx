"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Facebook, Instagram } from "lucide-react";
import Logo from "./Logo";
import { createClient } from "@/lib/supabase/client";

function TikTok({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.3 0 .6.05.88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  );
}

function XLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817-5.966 6.817H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

// Social links come from Supabase: app_settings row where key = 'socials'
// (jsonb, keys facebook/instagram/twitter/tiktok). Read with the anon key.
type Socials = { facebook?: string; instagram?: string; twitter?: string; tiktok?: string };

export default function Footer() {
  const pathname = usePathname();
  const [socials, setSocials] = useState<Socials>({});

  useEffect(() => {
    (async () => {
      const { data } = await createClient().from("app_settings").select("value").eq("key", "socials").maybeSingle();
      if (data?.value) setSocials(data.value as Socials);
    })();
  }, []);

  if (pathname?.endsWith("/listen") || pathname === "/login" || pathname === "/signup" || pathname === "/reset-password") return null;

  return (
    <footer className="pb-24 md:pb-0">
      {/* bottom bar */}
      <div className="forest text-brand-100">
        <div className="mx-auto grid max-w-[96rem] gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
          <div className="md:col-span-2">
            <Logo light />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-brand-100/80">
              The world&apos;s best audiobooks and summaries — in English and Urdu. Listen anywhere, unlock with coins, and grow a little every day.
            </p>

            {/* social icons — from app_settings.socials; blanks are skipped */}
            <div className="mt-6 flex items-center gap-3">
              {[
                { label: "ZaraSuno on Facebook", Icon: Facebook, href: socials.facebook },
                { label: "ZaraSuno on Instagram", Icon: Instagram, href: socials.instagram },
                { label: "ZaraSuno on X", Icon: XLogo, href: socials.twitter },
                { label: "ZaraSuno on TikTok", Icon: TikTok, href: socials.tiktok },
              ]
                .filter(({ href }) => href && href.trim() !== "")
                .map(({ label, Icon, href }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/15 transition hover:-translate-y-0.5 hover:bg-gold-400 hover:text-brand-900"
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                ))}
            </div>
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
