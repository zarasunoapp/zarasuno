import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { priceForPackage } from "@/lib/queries";
import { stripeUnitAmount, roundPrice } from "@/lib/pricing";
import { countryFromHeaders } from "@/lib/geo";

// Creates a PaymentIntent for a coin package — used by the embedded Stripe
// Elements card form. Returns the client secret the browser confirms with.
export async function POST(req: Request) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "stripe_not_configured" }, { status: 500 });
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "not_authenticated" }, { status: 401 });

  const { packageId, promoCode } = await req.json().catch(() => ({}));
  const { data: pkg } = await supabase
    .from("coin_packages")
    .select("*")
    .eq("id", packageId)
    .eq("is_active", true)
    .maybeSingle();
  if (!pkg) return NextResponse.json({ error: "package_not_found" }, { status: 404 });

  const coins = (pkg.coin_amount ?? 0) + (pkg.bonus_coins ?? 0);

  // Price follows the visitor's live IP country (matches what the coins page
  // shows). Fall back to the saved profile country only when IP is unavailable.
  let country = countryFromHeaders(req.headers);
  if (!country) {
    const { data: prof } = await supabase.from("profiles").select("country").eq("id", user.id).maybeSingle();
    country = prof?.country ?? null;
  }
  const localized = await priceForPackage(supabase, pkg, country);
  let amount = localized.price;
  const displayCurrency = localized.currency;
  const currency = displayCurrency.toLowerCase();

  // Re-validate any discount code server-side — apply the % to the base price.
  let promocodeId: string | null = null;
  if (promoCode) {
    const { data: v } = await supabase.rpc("validate_discount_promo", {
      p_code: String(promoCode).trim(),
      p_package_id: pkg.id,
    });
    if (!v?.success) return NextResponse.json({ error: "promo_invalid", reason: v?.error }, { status: 400 });
    amount = roundPrice(amount * (1 - Number(v.discount_percent) / 100), displayCurrency);
    promocodeId = v.promocode_id;
  }

  try {
    const intent = await stripe.paymentIntents.create({
      amount: stripeUnitAmount(amount, displayCurrency),
      currency,
      payment_method_types: ["card"],
      metadata: {
        user_id: user.id,
        package_id: pkg.id,
        coins: String(coins),
        amount: String(amount),
        promocode_id: promocodeId ?? "",
      },
    });
    return NextResponse.json({
      clientSecret: intent.client_secret,
      coins,
      amount,
      currency: displayCurrency,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "stripe_error" }, { status: 400 });
  }
}
