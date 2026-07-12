"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Mail, User, KeyRound, ArrowRight, Loader2, CheckCircle2, Eye, EyeOff, Star, Quote, Phone } from "lucide-react";
import Logo from "@/components/Logo";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const supabase = createClient();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const signup = async () => {
    setError(null);
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName, phone: phone.trim() || null }, emailRedirectTo: typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : undefined },
    });
    setLoading(false);
    if (error) return setError(error.message);
    if (data.session) {
      window.location.href = "/";
    } else {
      setSent(true);
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

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* LEFT — brand panel with background image */}
      <div className="relative hidden overflow-hidden lg:block">
        <Image
          src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1400&q=80"
          alt="A world of books"
          fill
          priority
          sizes="50vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-brand-900 via-brand-900/85 to-brand-800/80" />
        <div className="absolute inset-0 bg-hero-mesh opacity-60" />
        <div className="grain absolute inset-0" />

        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <Logo light />
          <div>
            <Quote className="h-9 w-9 text-gold-400" />
            <p className="mt-5 max-w-md font-serif text-3xl font-medium leading-snug">
              &ldquo;A reader lives a thousand lives before he dies.&rdquo;
            </p>
            <p className="mt-4 text-sm uppercase tracking-[0.3em] text-gold-200">— George R.R. Martin</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex gap-0.5">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} className="h-4 w-4 fill-gold-400 text-gold-400" />
              ))}
            </div>
            <p className="text-sm text-brand-100">Loved by <span className="font-semibold text-white">50,000+</span> listeners</p>
          </div>
        </div>
      </div>

      {/* RIGHT — form */}
      <div className="relative flex items-center justify-center overflow-hidden bg-white px-5 py-12 sm:px-8">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-100/60 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-gold-100/70 blur-3xl" />

        <div className="relative w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="mb-5 flex justify-center lg:hidden"><Logo /></div>
            <h1 className="display text-3xl text-brand-700 sm:text-4xl">Create your account</h1>
            <p className="mt-2 text-gray-500">Get 50 free coins to start listening.</p>
          </div>

          {sent ? (
            <div className="rounded-3xl bg-white p-8 text-center shadow-card ring-1 ring-black/5">
              <CheckCircle2 className="mx-auto h-14 w-14 text-brand-500" />
              <h2 className="mt-4 font-serif text-2xl font-semibold text-gray-900">Check your inbox</h2>
              <p className="mt-2 text-gray-500">We sent a confirmation link to <span className="font-semibold">{email}</span>. Confirm it, then sign in.</p>
              <Link href="/login" className="mt-6 inline-block rounded-full bg-brand px-7 py-3 font-semibold text-white hover:bg-brand-600">Go to sign in</Link>
            </div>
          ) : (
            <div className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-black/5 sm:p-8">
              <div className="space-y-4">
                <div className="relative">
                  <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input value={fullName} onChange={(e) => setFullName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && signup()} placeholder="Full name" className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-3.5 pl-12 pr-4 text-sm outline-none transition focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand-100" />
                </div>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === "Enter" && signup()} placeholder="you@example.com" className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-3.5 pl-12 pr-4 text-sm outline-none transition focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand-100" />
                </div>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} onKeyDown={(e) => e.key === "Enter" && signup()} placeholder="Phone number (optional)" className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-3.5 pl-12 pr-4 text-sm outline-none transition focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand-100" />
                </div>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && signup()}
                    placeholder="Create a password"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-3.5 pl-12 pr-12 text-sm outline-none transition focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand-100"
                  />
                  <button type="button" onClick={() => setShowPw((v) => !v)} aria-label={showPw ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-brand-700">
                    {showPw ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>

                {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>}

                <button onClick={signup} disabled={loading || !email || !password} className="btn-green flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-semibold disabled:opacity-70">
                  {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating account…</> : <>Sign up <ArrowRight className="h-4 w-4" /></>}
                </button>

                <div className="flex items-center gap-3 py-1">
                  <span className="h-px flex-1 bg-gray-200" />
                  <span className="text-xs text-gray-400">or</span>
                  <span className="h-px flex-1 bg-gray-200" />
                </div>

                <button onClick={google} className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 py-3.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50">
                  <span className="text-lg font-bold text-brand-600">G</span> Continue with Google
                </button>
              </div>
            </div>
          )}

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account? <Link href="/login" className="font-semibold text-brand-700 hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
