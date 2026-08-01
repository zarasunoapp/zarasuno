import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Verifies an in-app purchase receipt with Apple, then credits the coins.
//
// The mobile app sells coin packs via StoreKit on iOS (App Store rule 3.1.1).
// After StoreKit reports a successful purchase the app POSTs the receipt here;
// we validate it against Apple, resolve the product id to a coin package
// server-side (never trusting a client-sent package id) and credit idempotently
// on the store transaction id.
//
// Requires: APPLE_IAP_SHARED_SECRET (App Store Connect → App-Specific Shared
// Secret) and the db/iap-purchases.sql migration.

const APPLE_PROD = "https://buy.itunes.apple.com/verifyReceipt";
const APPLE_SANDBOX = "https://sandbox.itunes.apple.com/verifyReceipt";

interface AppleInApp {
  product_id: string;
  transaction_id: string;
  original_transaction_id?: string;
  purchase_date_ms?: string;
}

export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "not_authenticated" }, { status: 401 });

  const { platform, receipt, productId } = await req.json().catch(() => ({}));

  if (platform !== "ios") {
    // Android sells coins through Stripe, so Play Billing is not wired up.
    return NextResponse.json({ error: "unsupported_platform" }, { status: 400 });
  }
  if (!receipt || !productId) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }
  if (!process.env.APPLE_IAP_SHARED_SECRET) {
    return NextResponse.json({ error: "iap_not_configured" }, { status: 500 });
  }

  // --- validate the receipt with Apple (production first, then sandbox) -------
  let payload: any;
  try {
    payload = await verifyWithApple(String(receipt));
  } catch {
    return NextResponse.json({ error: "apple_unreachable" }, { status: 502 });
  }
  if (payload?.status !== 0) {
    return NextResponse.json({ error: "invalid_receipt", status: payload?.status }, { status: 400 });
  }

  // Newest matching purchase for this product.
  const entries: AppleInApp[] = [
    ...(payload?.latest_receipt_info ?? []),
    ...(payload?.receipt?.in_app ?? []),
  ];
  const match = entries
    .filter((e) => e.product_id === productId)
    .sort((a, b) => Number(b.purchase_date_ms ?? 0) - Number(a.purchase_date_ms ?? 0))[0];

  if (!match?.transaction_id) {
    return NextResponse.json({ error: "product_not_in_receipt" }, { status: 400 });
  }

  const admin = createAdminClient();

  // --- resolve product id → coin package (server-side, authoritative) --------
  const { data: mapping } = await admin
    .from("iap_products")
    .select("package_id")
    .eq("product_id", productId)
    .eq("platform", "ios")
    .eq("is_active", true)
    .maybeSingle();

  if (!mapping?.package_id) {
    return NextResponse.json({ error: "product_not_mapped" }, { status: 404 });
  }

  const { data: pkg } = await admin
    .from("coin_packages")
    .select("id, coin_amount, bonus_coins, price, currency")
    .eq("id", mapping.package_id)
    .eq("is_active", true)
    .maybeSingle();

  if (!pkg) return NextResponse.json({ error: "package_not_found" }, { status: 404 });

  const coins = (pkg.coin_amount ?? 0) + (pkg.bonus_coins ?? 0);

  // --- credit (idempotent on the Apple transaction id) ----------------------
  const { data: credit, error } = await admin.rpc("credit_iap_purchase", {
    p_user_id: user.id,
    p_coins: coins,
    p_amount: Number(pkg.price ?? 0),
    p_currency: pkg.currency ?? "USD",
    p_package_id: pkg.id,
    p_reference: `apple:${match.transaction_id}`,
    p_provider: "apple",
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    ok: true,
    coins,
    credited: !!credit?.credited,
    balance: credit?.balance ?? null,
  });
}

async function verifyWithApple(receiptData: string) {
  // No `exclude-old-transactions`: coin packs are consumables, and that flag
  // trims the entries we need to match a specific purchase against.
  const body = JSON.stringify({
    "receipt-data": receiptData,
    password: process.env.APPLE_IAP_SHARED_SECRET,
  });

  const post = async (url: string) => {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      cache: "no-store",
    });
    return res.json();
  };

  let out = await post(APPLE_PROD);
  // 21007 = this is a sandbox receipt sent to production (TestFlight builds).
  if (out?.status === 21007) out = await post(APPLE_SANDBOX);
  return out;
}
