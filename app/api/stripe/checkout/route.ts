import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { priceForPackage } from "@/lib/queries";
import { stripeUnitAmount, roundPrice } from "@/lib/pricing";
import { countryFromHeaders } from "@/lib/geo";

// Creates a Stripe Checkout Session for a coin package and returns its URL.
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
  const origin = req.headers.get("origin") ?? new URL(req.url).origin;

  // Price follows the visitor's live IP country (matches the coins page).
  // Fall back to the saved profile country only when IP is unavailable.
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
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: user.email ?? undefined,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency,
            unit_amount: stripeUnitAmount(amount, displayCurrency), // smallest currency unit
            product_data: {
              name: `${coins} ZaraSuno Coins`,
              description: pkg.name ?? undefined,
            },
          },
        },
      ],
      // metadata is echoed back on the webhook / verify so we credit the right user
      metadata: {
        user_id: user.id,
        package_id: pkg.id,
        coins: String(coins),
        amount: String(amount),
        promocode_id: promocodeId ?? "",
      },
      success_url: `${origin}/coins?success=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/coins?canceled=1`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    // e.g. currency not supported by the Stripe account
    return NextResponse.json({ error: err?.message ?? "stripe_error" }, { status: 400 });
  }
}
