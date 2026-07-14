import { headers } from "next/headers";
import { getCoinPackages, getPaymentConfigs, getSessionUser } from "@/lib/queries";
import { createClient } from "@/lib/supabase/server";
import { countryFromHeaders } from "@/lib/geo";
import CoinsClient from "@/components/CoinsClient";

export const dynamic = "force-dynamic";

export default async function CoinsPage() {
  const user = await getSessionUser();
  const ipCountry = countryFromHeaders(headers()); // visitor's country by IP (Vercel)

  // Prices always follow the visitor's live IP country. Only when the IP header
  // isn't available (e.g. local dev) do we fall back to the saved profile country.
  let country = ipCountry ?? "PK";
  if (!ipCountry && user) {
    const db = createClient();
    const { data } = await db.from("profiles").select("country").eq("id", user.id).maybeSingle();
    country = data?.country ?? "PK";
  }

  const [packages, configs] = await Promise.all([
    getCoinPackages(country),
    getPaymentConfigs(country),
  ]);

  return <CoinsClient packages={packages} configs={configs} country={country} />;
}
