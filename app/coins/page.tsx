import { getCoinPackages, getPaymentConfigs, getSessionUser } from "@/lib/queries";
import { createClient } from "@/lib/supabase/server";
import CoinsClient from "@/components/CoinsClient";

export const dynamic = "force-dynamic";

export default async function CoinsPage() {
  const user = await getSessionUser();
  let country = "PK";
  if (user) {
    const db = createClient();
    const { data } = await db.from("profiles").select("country").eq("id", user.id).maybeSingle();
    country = data?.country ?? "PK";
  }

  const [packages, configs] = await Promise.all([
    getCoinPackages(),
    getPaymentConfigs(country),
  ]);

  return <CoinsClient packages={packages} configs={configs} country={country} />;
}
