import { currencyForCountry } from "@/lib/countries";

// Currency localisation. Country → currency comes from a bundled map; the daily
// FX rate is fetched live from open.er-api.com (free, no key) and cached 24h so
// the display price and the charged price share the same rate within a day.
const TTL = 60 * 60 * 24; // 24h

// Stripe zero-decimal currencies (amount is NOT multiplied by 100)
const ZERO_DECIMAL = new Set([
  "bif", "clp", "djf", "gnf", "jpy", "kmf", "krw", "mga", "pyg", "rwf",
  "ugx", "vnd", "vuv", "xaf", "xof", "xpf",
]);

export function stripeUnitAmount(amount: number, currency: string): number {
  return ZERO_DECIMAL.has(currency.toLowerCase()) ? Math.round(amount) : Math.round(amount * 100);
}

export function roundPrice(v: number, currency: string): number {
  return ZERO_DECIMAL.has(currency.toLowerCase()) ? Math.round(v) : Math.round(v * 100) / 100;
}

export async function fxRate(from: string, to: string): Promise<number | null> {
  if (from.toUpperCase() === to.toUpperCase()) return 1;
  try {
    const res = await fetch(`https://open.er-api.com/v6/latest/${from.toUpperCase()}`, {
      next: { revalidate: TTL },
    });
    if (!res.ok) return null;
    const d = await res.json();
    const r = d?.rates?.[to.toUpperCase()];
    return typeof r === "number" ? r : null;
  } catch {
    return null;
  }
}

// Convert a base price into the user's country currency at today's rate.
// Falls back to the base price if anything is unavailable.
export async function convertedPrice(
  basePrice: number,
  baseCurrency: string,
  country: string
): Promise<{ price: number; currency: string }> {
  const target = currencyForCountry(country);
  if (!target || target.toUpperCase() === baseCurrency.toUpperCase()) {
    return { price: basePrice, currency: baseCurrency };
  }
  const rate = await fxRate(baseCurrency, target);
  if (!rate) return { price: basePrice, currency: baseCurrency };
  return { price: roundPrice(basePrice * rate, target), currency: target };
}
