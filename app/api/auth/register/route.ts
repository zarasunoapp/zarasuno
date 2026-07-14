import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { countryFromHeaders } from "@/lib/geo";

// Registers a user WITHOUT email confirmation — the account is created already
// confirmed (email_confirm: true), so the client can sign in immediately.
// The handle_new_user trigger fills profiles (full_name, phone) from metadata.
export async function POST(req: Request) {
  const { email, password, fullName, phone } = await req.json().catch(() => ({}));
  if (!email || !password) return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  if (String(password).length < 6) return NextResponse.json({ error: "weak_password" }, { status: 400 });

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.createUser({
    email: String(email).trim(),
    password: String(password),
    email_confirm: true,
    user_metadata: { full_name: fullName ?? null, phone: (phone && String(phone).trim()) || null },
  });

  if (error) {
    if (/already|registered|exists|duplicate/i.test(error.message)) {
      return NextResponse.json({ error: "already_registered" }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // set the new user's country from their IP (prices localise to their region)
  const ipCountry = countryFromHeaders(req.headers);
  if (ipCountry && data.user) {
    await admin.from("profiles").update({ country: ipCountry }).eq("id", data.user.id);
  }

  return NextResponse.json({ ok: true });
}
