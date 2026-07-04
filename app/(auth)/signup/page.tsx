"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, User, KeyRound, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import Logo from "@/components/Logo";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const supabase = createClient();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const signup = async () => {
    setError(null);
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName }, emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined },
    });
    setLoading(false);
    if (error) return setError(error.message);
    if (data.session) {
      window.location.href = "/"; // full navigation so the server sees the session
    } else {
      setSent(true); // email confirmation required
    }
  };

  const google = async () => {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setError(
        /not enabled|unsupported provider/i.test(error.message)
          ? "Google sign-in isn't enabled yet. Please use email + password, or enable Google in Supabase."
          : error.message
      );
    }
  };

  if (sent) {
    return (
      <div className="mx-auto flex min-h-[80vh] max-w-md flex-col items-center justify-center px-6 text-center">
        <CheckCircle2 className="h-14 w-14 text-brand-500" />
        <h1 className="mt-4 display text-2xl text-gray-900">Check your inbox</h1>
        <p className="mt-2 text-gray-500">We sent a confirmation link to <span className="font-semibold">{email}</span>. Confirm it, then sign in.</p>
        <Link href="/login" className="mt-6 rounded-full bg-brand px-7 py-3 font-semibold text-white hover:bg-brand-600">Go to sign in</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-6 py-12">
      <div className="text-center">
        <div className="flex justify-center"><Logo /></div>
        <h1 className="mt-6 display text-3xl text-gray-900">Create your account</h1>
        <p className="mt-1 text-gray-500">Get 50 free coins to start listening.</p>
      </div>

      <div className="mt-8 space-y-4">
        <div className="relative">
          <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full name" className="w-full rounded-xl border border-gray-200 py-3.5 pl-12 pr-4 text-sm outline-none focus:border-brand" />
        </div>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full rounded-xl border border-gray-200 py-3.5 pl-12 pr-4 text-sm outline-none focus:border-brand" />
        </div>
        <div className="relative">
          <KeyRound className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create a password" className="w-full rounded-xl border border-gray-200 py-3.5 pl-12 pr-4 text-sm outline-none focus:border-brand" />
        </div>

        {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>}

        <button onClick={signup} disabled={loading || !email || !password} className="flex w-full items-center justify-center gap-2 rounded-full bg-brand py-3.5 font-semibold text-white transition hover:bg-brand-600 disabled:opacity-60">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Sign up <ArrowRight className="h-4 w-4" /></>}
        </button>
        <button onClick={google} className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-200 py-3.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">
          <span className="text-lg">G</span> Continue with Google
        </button>
      </div>

      <p className="mt-6 text-center text-sm text-gray-500">
        Already have an account? <Link href="/login" className="font-semibold text-brand-700 hover:underline">Sign in</Link>
      </p>
    </div>
  );
}
