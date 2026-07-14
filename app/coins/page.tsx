import { headers } from "next/headers";
import { getCoinPackages, getPaymentConfigs, getSessionUser } from "@/lib/queries";
import { createClient } from "@/lib/supabase/server";
import { countryFromHeaders } from "@/lib/geo";
import CoinsClient from "@/components/CoinsClient";

export const dynamic = "force-dynamic";

export default async function CoinsPage() {
  const user = await getSessionUser();
  const ipCountry = countryFromHeaders(headers()); // visitor's country by IP (Vercel)

  // signed-in: their saved profile country (auto-set from IP at signup, editable)
  // signed-out: live IP country. Fallback to PK.
  let country = ipCountry ?? "PK";
  if (user) {
    const db = createClient();
    const { data } = await db.from("profiles").select("country").eq("id", user.id).maybeSingle();
    country = data?.country || ipCountry || "PK";
  }

  const [packages, configs] = await Promise.all([
    getCoinPackages(country),
    getPaymentConfigs(country),
  ]);

  return <CoinsClient packages={packages} configs={configs} country={country} />;
}
