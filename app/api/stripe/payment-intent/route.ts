import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

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
  const currency = String(pkg.currency ?? "USD").toLowerCase();

  // Re-validate any discount code server-side — never trust the client price.
  let amount = Number(pkg.price);
  let promocodeId: string | null = null;
  if (promoCode) {
    const { data: v } = await supabase.rpc("validate_discount_promo", {
      p_code: String(promoCode).trim(),
      p_package_id: pkg.id,
    });
    if (!v?.success) return NextResponse.json({ error: "promo_invalid", reason: v?.error }, { status: 400 });
    amount = Number(v.final_price);
    promocodeId = v.promocode_id;
  }

  try {
    const intent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
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
      currency: pkg.currency,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "stripe_error" }, { status: 400 });
  }
}
