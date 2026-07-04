import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// OAuth (Google) + email-link callback: exchanges the returned code for a
// session (sets the auth cookies) and redirects into the app. The DB trigger
// `handle_new_user` creates the profile row automatically for new users.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    return NextResponse.redirect(`${origin}/login?error=oauth`);
  }

  return NextResponse.redirect(`${origin}/login`);
}
