/**
 * localized-currency.ts — show prices in the visitor's local currency.
 * ---------------------------------------------------------------------------
 * Self-contained, zero-dependency drop-in for any Next.js (App Router) site.
 * Copy this ONE file into your project (e.g. `lib/localized-currency.ts`).
 *
 * How it works
 *   1. The visitor's country comes from a request header the host sets for free
 *      at the edge — no API key, no client geolocation prompt:
 *         • Vercel     → `x-vercel-ip-country`
 *         • Cloudflare → `cf-ipcountry`
 *         • Netlify    → `x-country` / `x-nf-geo`
 *   2. A bundled country → currency map turns "PK" into "PKR", etc.
 *   3. A free daily FX rate (open.er-api.com, no key) converts your base price
 *      into that currency. Rate is cached 24h so the shown price is stable.
 *   4. Intl.NumberFormat formats it (symbol, thousands separators, decimals).
 *
 * Everything degrades gracefully: if the country/rate is unavailable it falls
 * back to your base price and currency — nothing ever throws.
 *
 * ── USAGE (App Router) ──────────────────────────────────────────────────────
 *
 *   // Server Component or Route Handler (runs on the server, where headers live)
 *   import { headers } from "next/headers";
 *   import { localizePrice, detectCountry } from "@/lib/localized-currency";
 *
 *   export default async function Page() {
 *     const h = headers();
 *     // Your product is priced in, say, USD 9.99:
 *     const price = await localizePrice(9.99, "USD", h);
 *     // price -> { amount: 2780, currency: "PKR", formatted: "PKR 2,780", country: "PK" }
 *     return <p>{price.formatted}</p>;
 *   }
 *
 *   // Just need the currency code / country?
 *   const country = detectCountry(headers());          // "PK" | null
 *   const cur = currencyForCountry(country ?? "US");   // "PKR"
 *
 * NOTE: header geolocation only works on a deployed host (Vercel/CF/Netlify).
 * On localhost the header is absent → it falls back to DEFAULT_COUNTRY below.
 * To test locally you can pass a country manually or set DEFAULT_COUNTRY.
 * ---------------------------------------------------------------------------
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
  // Ignore placeholders hosts use for unknown / anonymised IPs.
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
      // Next.js: cache the response for FX_TTL. On non-Next runtimes this option
      // is simply ignored.
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

/** "PKR 2,780" / "$9.99" — uses the browser/Node Intl currency formatter. */
export function formatMoney(amount: number, currency: string, locale?: string): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency.toUpperCase(),
      minimumFractionDigits: ZERO_DECIMAL.has(currency.toUpperCase()) ? 0 : undefined,
      maximumFractionDigits: ZERO_DECIMAL.has(currency.toUpperCase()) ? 0 : 2,
    }).format(amount);
  } catch {
    // Unknown currency code → plain "CODE 1,234"
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
 * The one call you usually need. Detects the country from headers, converts the
 * base price to that country's currency at today's rate, and formats it.
 * Falls back to the base price/currency if geo or FX is unavailable.
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
    // FX unavailable → show the original price/currency (never throw).
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
