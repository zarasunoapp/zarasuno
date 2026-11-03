# Feature: show prices in the visitor's local currency (auto by country)

Hand this whole file to Claude Code (or any dev) to add "local currency by
country" to a **Next.js (App Router)** website. It is self-contained — the full
code is included below.

---

## What this feature does

When someone opens the site, prices are shown in **their country's currency**
automatically (a visitor in Pakistan sees `PKR`, in the UK `£`, in Japan `¥`,
etc.). No login, no "choose your country" step, no paid API, no client-side
geolocation permission prompt.

## How it works (the mechanism)

1. **Country detection is free at the edge.** The hosting platform already knows
   the visitor's country from their IP and adds it as a request **header** —
   your code just reads it:
   - **Vercel** → `x-vercel-ip-country`
   - **Cloudflare** → `cf-ipcountry`
   - **Netlify** → `x-country`
2. A bundled **country → currency** map turns `"PK"` into `"PKR"`, etc.
3. A free **daily FX rate** from `open.er-api.com` (no API key) converts your base
   price into that currency. The rate is **cached 24h**, so the displayed price
   is stable through the day.
4. `Intl.NumberFormat` formats the number (symbol, separators, decimals).
5. Everything **degrades gracefully** — if country or FX is unavailable it falls
   back to the base price/currency and never throws.

> ⚠️ **Works only on a deployed host** (Vercel/Cloudflare/Netlify) where the geo
> header exists. On **localhost** the header is absent → it uses `DEFAULT_COUNTRY`.

---

## Step 1 — create the file

Create `lib/localized-currency.ts` with exactly this content:

```ts
/**
 * localized-currency.ts — show prices in the visitor's local currency.
 * Self-contained, zero-dependency drop-in for any Next.js (App Router) site.
 */

// Default when the country can't be detected (e.g. local dev, unknown IP).
const DEFAULT_COUNTRY = "US";

// FX cache lifetime (seconds). 24h keeps the displayed price stable for a day.
const FX_TTL = 60 * 60 * 24;

// ── Country → ISO currency ─────────────────────────────────────────────────
export const COUNTRY_CURRENCY: Record<string, string> = {
  PK: "PKR", IN: "INR", BD: "BDT", LK: "LKR", NP: "NPR", BT: "BTN", MV: "MVR", AF: "AFN",
  AU: "AUD", NZ: "NZD", US: "USD", CA: "CAD", GB: "GBP", IE: "EUR",
  AE: "AED", SA: "SAR", QA: "QAR", KW: "KWD", BH: "BHD", OM: "OMR", JO: "JOD", LB: "LBP",
  IQ: "IQD", IR: "IRR", IL: "ILS", PS: "ILS", TR: "TRY",
  EG: "EGP", MA: "MAD", DZ: "DZD", TN: "TND", LY: "LYD", SD: "SDG",
  ZA: "ZAR", NG: "NGN", KE: "KES", GH: "GHS", TZ: "TZS", UG: "UGX", ET: "ETB", RW: "RWF",
  SN: "XOF", CI: "XOF", CM: "XAF", ZM: "ZMW", ZW: "ZWL",
  DE: "EUR", FR: "EUR", IT: "EUR", ES: "EUR", PT: "EUR", NL: "EUR", BE: "EUR", AT: "EUR",
  GR: "EUR", FI: "EUR", LU: "EUR", CY: "EUR", MT: "EUR", SK: "EUR", HR: "EUR", SI: "EUR",
  CH: "CHF", SE: "SEK", NO: "NOK", DK: "DKK", IS: "ISK", PL: "PLN", CZ: "CZK", HU: "HUF",
  RO: "RON", BG: "BGN", RS: "RSD", UA: "UAH", RU: "RUB", BY: "BYN",
  KZ: "KZT", UZ: "UZS", AZ: "AZN", GE: "GEL", AM: "AMD",
  CN: "CNY", HK: "HKD", TW: "TWD", JP: "JPY", KR: "KRW", SG: "SGD", MY: "MYR", ID: "IDR",
  TH: "THB", VN: "VND", PH: "PHP", MM: "MMK", KH: "KHR", LA: "LAK",
  BR: "BRL", MX: "MXN", AR: "ARS", CL: "CLP", CO: "COP", PE: "PEN", VE: "VES", EC: "USD",
  UY: "UYU", BO: "BOB", PY: "PYG", CR: "CRC", PA: "USD",
};

// Currencies with no minor units — never show decimals for these.
const ZERO_DECIMAL = new Set([
  "BIF", "CLP", "DJF", "GNF", "JPY", "KMF", "KRW", "MGA", "PYG", "RWF",
  "UGX", "VND", "VUV", "XAF", "XOF", "XPF", "ISK", "HUF",
]);

// ── 1. Detect the visitor's country from request headers ───────────────────
/** Returns an uppercase ISO-2 country code, or null if it can't be determined. */
export function detectCountry(h: Headers): string | null {
  const raw =
    h.get("x-vercel-ip-country") || // Vercel
    h.get("cf-ipcountry") ||        // Cloudflare
    h.get("x-country") ||           // Netlify / custom
    "";
  const code = raw.trim().toUpperCase();
  if (code.length !== 2 || ["XX", "T1", "ZZ", "EU"].includes(code)) return null;
  return code;
}

// ── 2. Country → currency ──────────────────────────────────────────────────
export function currencyForCountry(country: string | null): string {
  if (!country) return COUNTRY_CURRENCY[DEFAULT_COUNTRY];
  return COUNTRY_CURRENCY[country.toUpperCase()] ?? COUNTRY_CURRENCY[DEFAULT_COUNTRY];
}

// ── 3. Live FX rate (free, no key), cached 24h ─────────────────────────────
export async function fxRate(from: string, to: string): Promise<number | null> {
  if (from.toUpperCase() === to.toUpperCase()) return 1;
  try {
    const res = await fetch(`https://open.er-api.com/v6/latest/${from.toUpperCase()}`, {
      next: { revalidate: FX_TTL },
    } as RequestInit);
    if (!res.ok) return null;
    const data = await res.json();
    const rate = data?.rates?.[to.toUpperCase()];
    return typeof rate === "number" ? rate : null;
  } catch {
    return null;
  }
}

// ── 4. Rounding + formatting helpers ───────────────────────────────────────
export function roundForCurrency(value: number, currency: string): number {
  return ZERO_DECIMAL.has(currency.toUpperCase())
    ? Math.round(value)
    : Math.round(value * 100) / 100;
}

/** "PKR 2,780" / "$9.99" — uses the Intl currency formatter. */
export function formatMoney(amount: number, currency: string, locale?: string): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency.toUpperCase(),
      minimumFractionDigits: ZERO_DECIMAL.has(currency.toUpperCase()) ? 0 : undefined,
      maximumFractionDigits: ZERO_DECIMAL.has(currency.toUpperCase()) ? 0 : 2,
    }).format(amount);
  } catch {
    return `${currency.toUpperCase()} ${amount.toLocaleString()}`;
  }
}

// ── 5. Convert a base price into the visitor's currency ────────────────────
export type LocalPrice = {
  amount: number;      // converted numeric amount
  currency: string;    // target currency code (e.g. "PKR")
  formatted: string;   // ready-to-render string (e.g. "PKR 2,780")
  country: string | null;
  baseAmount: number;  // the original amount you passed in
  rate: number;        // FX multiplier used (1 if same currency / fallback)
};

/**
 * The one call you usually need. Detects country from headers, converts the
 * base price to that currency at today's rate, and formats it. Falls back to
 * the base price/currency if geo or FX is unavailable.
 */
export async function localizePrice(
  basePrice: number,
  baseCurrency: string,
  headers: Headers,
  locale?: string
): Promise<LocalPrice> {
  const country = detectCountry(headers);
  const target = currencyForCountry(country);

  if (target.toUpperCase() === baseCurrency.toUpperCase()) {
    return {
      amount: roundForCurrency(basePrice, baseCurrency),
      currency: baseCurrency.toUpperCase(),
      formatted: formatMoney(basePrice, baseCurrency, locale),
      country, baseAmount: basePrice, rate: 1,
    };
  }

  const rate = await fxRate(baseCurrency, target);
  if (!rate) {
    return {
      amount: roundForCurrency(basePrice, baseCurrency),
      currency: baseCurrency.toUpperCase(),
      formatted: formatMoney(basePrice, baseCurrency, locale),
      country, baseAmount: basePrice, rate: 1,
    };
  }

  const amount = roundForCurrency(basePrice * rate, target);
  return {
    amount,
    currency: target,
    formatted: formatMoney(amount, target, locale),
    country, baseAmount: basePrice, rate,
  };
}
```

---

## Step 2 — use it in a page (Server Component)

`next/headers` only exists on the **server**, so call it from a Server Component,
Route Handler, or server action, then pass the result to any client component.

```tsx
// app/pricing/page.tsx  (a Server Component — no "use client")
import { headers } from "next/headers";
import { localizePrice } from "@/lib/localized-currency";

export const dynamic = "force-dynamic"; // per-request (geo differs per visitor)

export default async function PricingPage() {
  const h = headers();

  // Your products, priced in ONE base currency (e.g. USD):
  const products = [
    { name: "Starter", usd: 9.99 },
    { name: "Pro", usd: 19.99 },
  ];

  const priced = await Promise.all(
    products.map(async (p) => ({
      ...p,
      local: await localizePrice(p.usd, "USD", h),
    }))
  );

  return (
    <ul>
      {priced.map((p) => (
        <li key={p.name}>
          {p.name} — {p.local.formatted}   {/* e.g. "PKR 2,780" */}
        </li>
      ))}
    </ul>
  );
}
```

Just need the currency code (not a converted price)?

```ts
import { headers } from "next/headers";
import { detectCountry, currencyForCountry } from "@/lib/localized-currency";

const country = detectCountry(headers());        // "PK" | null
const currency = currencyForCountry(country);    // "PKR"
```

---

## Step 3 — passing it to Client Components

Detect/convert on the server, then hand the plain result down as props:

```tsx
// server component
const local = await localizePrice(19.99, "USD", headers());
return <BuyButton priceLabel={local.formatted} amount={local.amount} currency={local.currency} />;
```

```tsx
"use client";
export function BuyButton({ priceLabel }: { priceLabel: string }) {
  return <button>Buy — {priceLabel}</button>;
}
```

---

## Optional — let users override the auto-detected country

Auto-detect first, but remember a manual choice in a cookie:

```ts
import { cookies, headers } from "next/headers";
import { detectCountry, currencyForCountry } from "@/lib/localized-currency";

const chosen = cookies().get("country")?.value;         // set when user picks one
const country = chosen || detectCountry(headers()) || "US";
const currency = currencyForCountry(country);
```

Set the cookie from a client action when the user selects a country in a dropdown.

---

## Important notes / gotchas

- **Localhost shows the fallback.** The geo header only exists on the deployed
  host. Locally you'll always get `DEFAULT_COUNTRY` (`US`). To test another
  country locally, temporarily change `DEFAULT_COUNTRY`, or read a manual cookie
  as shown above.
- **Enable per-request rendering** on pages that show localized prices:
  `export const dynamic = "force-dynamic";` (otherwise Next may statically cache
  one country's price for everyone).
- **Display vs. charging.** This gives a *display* price. If you actually charge
  (Stripe etc.), send the **same converted amount + currency** to checkout so the
  shown price equals the charged price. Note Stripe uses the smallest unit —
  multiply by 100 for normal currencies, but **not** for zero-decimal ones
  (JPY, KRW, etc.); the `ZERO_DECIMAL` set here lists them.
- **FX source.** `open.er-api.com` is free and needs no key. If you want a
  contractually-backed rate, swap the `fxRate()` fetch URL for a paid provider —
  the rest of the code is unchanged.
- **Add more countries** by editing the `COUNTRY_CURRENCY` map. Anything missing
  falls back to `DEFAULT_COUNTRY`'s currency.

---

## Quick checklist

- [ ] Create `lib/localized-currency.ts` (Step 1).
- [ ] Deploy on Vercel/Cloudflare/Netlify (needed for geo header).
- [ ] Use `localizePrice(base, "USD", headers())` in a Server Component (Step 2).
- [ ] Add `export const dynamic = "force-dynamic";` to those pages.
- [ ] (If charging) reuse the converted amount/currency at checkout.
