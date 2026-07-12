"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { KeyRound, Loader2, Eye, EyeOff, CheckCircle2, ArrowRight } from "lucide-react";
import Logo from "@/components/Logo";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const supabase = createClient();
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState<boolean | null>(null); // has a recovery session?
  const [done, setDone] = useState(false);

  // the /auth/callback exchange lands us here with an active recovery session
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setReady(!!data.session));
  }, [supabase]);

  const submit = async () => {
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) return setError(error.message);
    setDone(true);
    setTimeout(() => { window.location.href = "/"; }, 1400);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white px-5 py-12">
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-100/60 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-gold-100/70 blur-3xl" />

      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-5 flex justify-center"><Logo /></div>
          <h1 className="display text-3xl text-brand-700 sm:text-4xl">Set a new password</h1>
          <p className="mt-2 text-gray-500">Choose a new password for your account.</p>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-black/5 sm:p-8">
          {done ? (
            <div className="text-center">
              <CheckCircle2 className="mx-auto h-14 w-14 text-brand-500" />
              <h2 className="mt-4 font-serif text-2xl font-semibold text-gray-900">Password updated 🎉</h2>
              <p className="mt-2 text-gray-500">Signing you in…</p>
              <Loader2 className="mx-auto mt-5 h-6 w-6 animate-spin text-brand-500" />
            </div>
          ) : ready === false ? (
            <div className="text-center">
              <p className="text-gray-600">This reset link is invalid or has expired.</p>
              <Link href="/login" className="mt-5 inline-block rounded-full bg-brand px-7 py-3 font-semibold text-white hover:bg-brand-600">Back to sign in</Link>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <KeyRound className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submit()}
                  placeholder="New password"
                  autoFocus
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-3.5 pl-12 pr-12 text-sm outline-none transition focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand-100"
                />
                <button type="button" onClick={() => setShowPw((v) => !v)} aria-label={showPw ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-brand-700">
                  {showPw ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>}

              <button onClick={submit} disabled={loading || password.length < 6} className="btn-green flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-semibold disabled:opacity-70">
                {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Updating…</> : <>Update password <ArrowRight className="h-4 w-4" /></>}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
