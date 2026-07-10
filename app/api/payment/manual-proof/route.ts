import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Manual payment (JazzCash / EasyPaisa / bank): uploads the payment screenshot
// to the `payment-proofs` bucket and records a PENDING transaction the admin
// panel can review and approve (which then credits the coins).
export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "not_authenticated" }, { status: 401 });

  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "bad_request" }, { status: 400 });

  const packageId = String(form.get("packageId") ?? "");
  const provider = String(form.get("provider") ?? "manual");
  const reference = String(form.get("reference") ?? "").trim();
  const promoCode = String(form.get("promoCode") ?? "").trim();
  const file = form.get("screenshot") as File | null;

  if (!packageId) return NextResponse.json({ error: "package_required" }, { status: 400 });
  if (!reference && !file) return NextResponse.json({ error: "proof_required" }, { status: 400 });

  // authoritative package details (never trust client amounts)
  const { data: pkg } = await supabase
    .from("coin_packages").select("*").eq("id", packageId).eq("is_active", true).maybeSingle();
  if (!pkg) return NextResponse.json({ error: "package_not_found" }, { status: 404 });

  // re-validate any discount code server-side → record the discounted amount
  let chargeAmount = Number(pkg.price);
  if (promoCode) {
    const { data: v } = await supabase.rpc("validate_discount_promo", {
      p_code: promoCode,
      p_package_id: pkg.id,
    });
    if (v?.success) chargeAmount = Number(v.final_price);
  }

  const admin = createAdminClient();
  let proofUrl: string | null = null;

  // upload the screenshot (if provided)
  if (file && file.size > 0) {
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
    const path = `${user.id}/${Date.now()}.${ext}`;
    const bytes = Buffer.from(await file.arrayBuffer());
    const { error: upErr } = await admin.storage
      .from("payment-proofs")
      .upload(path, bytes, { contentType: file.type || "image/jpeg", upsert: false });
    if (upErr) return NextResponse.json({ error: "upload_failed", detail: upErr.message }, { status: 500 });
    proofUrl = admin.storage.from("payment-proofs").getPublicUrl(path).data.publicUrl;
  }

  const coins = (pkg.coin_amount ?? 0) + (pkg.bonus_coins ?? 0);
  const providerValue = ["jazzcash", "easypaisa"].includes(provider) ? provider : "manual";

  const { error: insErr } = await admin.from("transactions").insert({
    user_id: user.id,
    type: "purchase",
    coin_change: coins,               // intended coins — credited when admin approves
    amount: chargeAmount,             // discounted price if a promo was applied
    currency: pkg.currency ?? "PKR",
    package_id: pkg.id,
    payment_provider: providerValue,
    payment_status: "pending",        // admin verifies the proof, then credits
    payment_reference: reference || null,
    payment_proof_url: proofUrl,
  });
  if (insErr) return NextResponse.json({ error: "insert_failed", detail: insErr.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
