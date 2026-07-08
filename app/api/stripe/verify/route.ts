import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Called when the user returns from Stripe (?session_id=...). Verifies the
// session was paid and credits the coins. Idempotent (same RPC + session id),
// so it's safe to run alongside the production webhook — no double credit.
export async function GET(req: Request) {
  const sessionId = new URL(req.url).searchParams.get("session_id");
  if (!sessionId) return NextResponse.json({ error: "missing_session" }, { status: 400 });

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "not_authenticated" }, { status: 401 });

  let session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "retrieve_failed" }, { status: 400 });
  }

  if (session.payment_status !== "paid") {
    return NextResponse.json({ ok: false, status: session.payment_status });
  }

  const m = session.metadata ?? {};
  if (m.user_id !== user.id) return NextResponse.json({ error: "user_mismatch" }, { status: 403 });

  const admin = createAdminClient();
  const { error } = await admin.rpc("credit_coin_purchase", {
    p_user_id: m.user_id,
    p_coins: Number(m.coins),
    p_amount: Number(m.amount ?? 0),
    p_package_id: m.package_id || null,
    p_reference: session.id,
    p_promocode_id: m.promocode_id || null,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, coins: Number(m.coins) });
}
