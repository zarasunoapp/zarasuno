import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Applies a promo code from the checkout box. All logic runs in a SECURITY
// DEFINER RPC — coins are granted atomically, discounts are only quoted here
// (the redemption is recorded on successful payment). The client just reflects
// whatever this returns.
export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ success: false, error: "not_authenticated" }, { status: 401 });

  const { code, packageId } = await req.json().catch(() => ({}));
  if (!code || !String(code).trim()) {
    return NextResponse.json({ success: false, error: "empty" }, { status: 400 });
  }

  const { data, error } = await supabase.rpc("apply_promocode", {
    p_code: String(code).trim(),
    p_package_id: packageId || null,
  });

  if (error) return NextResponse.json({ success: false, error: "server_error" }, { status: 500 });
  return NextResponse.json(data);
}
