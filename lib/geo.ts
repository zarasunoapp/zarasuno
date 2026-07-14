// Visitor's country from the request. On Vercel this header is set for free on
// every request (edge geolocation) — no external API or key needed.
export function countryFromHeaders(h: Headers): string | null {
  const c = h.get("x-vercel-ip-country");
  if (!c || c.length !== 2) return null;
  const code = c.toUpperCase();
  // ignore Vercel's placeholders for unknown / anonymised IPs
  if (code === "XX" || code === "T1" || code === "ZZ") return null;
  return code;
}
