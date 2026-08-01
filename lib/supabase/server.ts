import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies, headers } from "next/headers";

// Request-scoped Supabase client used by Server Components and API routes.
//
// Browser requests carry the session in cookies (@supabase/ssr). The native
// mobile app has no cookie jar, so it sends `Authorization: Bearer <access_token>`
// instead — we detect that and build a header-authenticated client so
// `auth.getUser()` and RLS resolve to the same user on both platforms.
//
// Web behaviour is unchanged: the Bearer branch only runs when the header is
// present AND no Supabase auth cookie exists.
export function createClient() {
  const cookieStore = cookies();

  const bearer = readBearer();
  const hasAuthCookie = cookieStore
    .getAll()
    .some((c) => c.name.startsWith("sb-") && c.name.includes("auth-token"));

  if (bearer && !hasAuthCookie) {
    return createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: { headers: { Authorization: `Bearer ${bearer}` } },
        // Stateless: never read or write a session on the server.
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      }
    ) as ReturnType<typeof createServerClient>;
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component — safe to ignore; middleware refreshes the session.
          }
        },
      },
    }
  );
}

// The access token from an `Authorization: Bearer <jwt>` header, if any.
function readBearer(): string | null {
  try {
    const raw = headers().get("authorization") ?? headers().get("Authorization");
    if (!raw) return null;
    const m = /^Bearer\s+(.+)$/i.exec(raw.trim());
    const token = m?.[1]?.trim();
    // Ignore the anon key being echoed back as a Bearer token — it carries no user.
    if (!token || token === process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return null;
    return token;
  } catch {
    return null;
  }
}
