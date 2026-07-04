"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Mail, KeyRound, ArrowRight, Loader2, Eye, EyeOff, Star, Quote } from "lucide-react";
import Logo from "@/components/Logo";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const supabase = createClient();
  const [mode, setMode] = useState<"password" | "otp">("password");
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const done = () => {
    // Full navigation so the server re-renders with the fresh session cookies.
    window.location.href = "/";
  };

  const loginPassword = async () => {
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setError(error.message);
    else done();
  };

  const sendOtp = async () => {
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
    setLoading(false);
    if (error) setError(error.message);
    else setStep("code");
  };

  const verifyOtp = async () => {
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({ email, token: code, type: "email" });
    setLoading(false);
    if (error) setError(error.message);
    else done();
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
      <div className="relative flex items-center justify-center overflow-hidden bg-ivory px-5 py-12 sm:px-8">
        {/* soft blobs */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-100/60 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-gold-100/70 blur-3xl" />

        <div className="relative w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="mb-5 flex justify-center lg:hidden"><Logo /></div>
            <h1 className="display text-3xl text-brand-700 sm:text-4xl">Welcome back</h1>
            <p className="mt-2 text-gray-500">Sign in to continue listening.</p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-black/5 sm:p-8">
            {/* mode tabs */}
            <div className="flex rounded-full bg-gray-100 p-1 text-sm font-medium">
              {(["password", "otp"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setStep("email"); setError(null); }}
                  className={`flex-1 rounded-full py-2.5 transition ${mode === m ? "bg-brand text-white shadow-soft" : "text-gray-500 hover:text-brand-700"}`}
                >
                  {m === "password" ? "Password" : "Email code"}
                </button>
              ))}
            </div>

            <div className="mt-6 space-y-4">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-3.5 pl-12 pr-4 text-sm outline-none transition focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand-100"
                />
              </div>

              {mode === "password" && (
                <div className="relative">
                  <KeyRound className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && loginPassword()}
                    placeholder="Password"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-3.5 pl-12 pr-12 text-sm outline-none transition focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    aria-label={showPw ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-brand-700"
                  >
                    {showPw ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              )}

              {mode === "otp" && step === "code" && (
                <div>
                  <p className="mb-2 text-sm text-gray-500">Enter the 6-digit code sent to {email}.</p>
                  <input
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="000000"
                    inputMode="numeric"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-3.5 text-center text-2xl font-semibold tracking-[0.5em] outline-none focus:border-brand focus:bg-white"
                  />
                </div>
              )}

              {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>}

              {mode === "password" ? (
                <button onClick={loginPassword} disabled={loading} className="btn-green flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-semibold disabled:opacity-60">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Sign in <ArrowRight className="h-4 w-4" /></>}
                </button>
              ) : step === "email" ? (
                <button onClick={sendOtp} disabled={loading || !email} className="btn-green flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-semibold disabled:opacity-60">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Send code <ArrowRight className="h-4 w-4" /></>}
                </button>
              ) : (
                <button onClick={verifyOtp} disabled={loading || code.length < 6} className="btn-green flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-semibold disabled:opacity-60">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Verify &amp; sign in <ArrowRight className="h-4 w-4" /></>}
                </button>
              )}

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

          <p className="mt-6 text-center text-sm text-gray-500">
            New to ZaraSuno? <Link href="/signup" className="font-semibold text-brand-700 hover:underline">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
