import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

// Stripe calls this after a successful payment. We verify the signature, then
// credit the coins to the user's balance (service-role, idempotent RPC).
export async function POST(req: Request) {
  const body = await req.text(); // raw body required for signature verification
  const sig = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !secret) {
    return NextResponse.json({ error: "webhook_not_configured" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (err: any) {
    return NextResponse.json({ error: `invalid_signature: ${err.message}` }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const m = session.metadata ?? {};
    if (m.user_id && m.coins) {
      const admin = createAdminClient();
      const { error } = await admin.rpc("credit_coin_purchase", {
        p_user_id: m.user_id,
        p_coins: Number(m.coins),
        p_amount: Number(m.amount ?? 0),
        p_package_id: m.package_id || null,
        p_reference: session.id, // idempotency key
      });
      if (error) {
        console.error("credit_coin_purchase failed:", error.message);
        return NextResponse.json({ error: "credit_failed" }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}
