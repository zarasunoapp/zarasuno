"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Coins, Check, Star, CreditCard, QrCode, Ticket, Sparkles, ShieldCheck, Upload, Info, Loader2,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { CoinPackage, PaymentConfig } from "@/lib/types";
import StripeCardModal from "./StripeCardModal";

type AppliedPromo = {
  code: string;
  promocodeId: string;
  discountPercent: number;
  finalPrice: number;
  originalPrice: number;
  packageId: string;
};

const PROMO_ERRORS: Record<string, string> = {
  empty: "Enter a promo code first.",
  not_authenticated: "Please sign in to use a promo code.",
  invalid: "Invalid promo code.",
  inactive: "This code is no longer active.",
  expired: "This code has expired.",
  not_started: "This code isn't active yet.",
  exhausted: "This code has reached its usage limit.",
  already_used: "You've already used this code.",
  not_applicable_to_package: "This code doesn't apply to the selected pack.",
  package_not_found: "Please pick a coin pack first.",
  select_package: "Please pick a coin pack first.",
  unknown_reward_type: "This code can't be applied here.",
};

export default function CoinsClient(props: { packages: CoinPackage[]; configs: PaymentConfig[]; country: string }) {
  return (
    <Suspense fallback={<div className="py-24 text-center text-gray-400">Loading…</div>}>
      <Inner {...props} />
    </Suspense>
  );
}

function Inner({ packages, configs, country }: { packages: CoinPackage[]; configs: PaymentConfig[]; country: string }) {
  const { signedIn, coins, addCoins, refresh } = useStore();
  const router = useRouter();
  const params = useSearchParams();
  const need = Number(params.get("need") || 0);
  const [busy, setBusy] = useState(false);

  // Returning from Stripe → verify the session, then refresh the balance.
  useEffect(() => {
    const sid = params.get("session_id");
    if (params.get("success")) {
      setToast("Verifying your payment…");
      (async () => {
        try {
          if (sid) await fetch(`/api/stripe/verify?session_id=${sid}`);
        } catch {}
        await refresh();
        setToast("Payment successful! Coins added to your balance. 🎉");
        setTimeout(() => setToast(null), 4000);
        // clean the ?success/session_id from the URL
        window.history.replaceState({}, "", "/coins");
      })();
    } else if (params.get("canceled")) {
      setToast("Payment canceled.");
      setTimeout(() => setToast(null), 3000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [selected, setSelected] = useState(packages[Math.min(1, packages.length - 1)]?.id ?? "");
  const [method, setMethod] = useState<PaymentConfig | null>(null);
  const [showCard, setShowCard] = useState(false);
  const [promo, setPromo] = useState("");
  const [applying, setApplying] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState<AppliedPromo | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const pkg = packages.find((p) => p.id === selected) ?? packages[0];

  // a discount applies only to the exact package it was validated against
  const discountFor = (id: string) => (appliedPromo && appliedPromo.packageId === id ? appliedPromo : null);
  const priceOf = (p: CoinPackage) => discountFor(p.id)?.finalPrice ?? p.price;
  const activePromoCode = appliedPromo && appliedPromo.packageId === selected ? appliedPromo.code : undefined;

  const flash = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(null), 3000);
  };

  const pay = async (config: PaymentConfig) => {
    if (!signedIn) return router.push("/login");
    if (!pkg) return;
    if (config.provider === "stripe") {
      setBusy(true);
      try {
        const res = await fetch("/api/stripe/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ packageId: pkg.id, promoCode: activePromoCode }),
        });
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url; // → Stripe hosted checkout
        } else if (data.error === "stripe_not_configured") {
          flash("Card payments aren't set up yet. Add your Stripe keys to enable them.");
        } else {
          flash("Couldn't start checkout. Please try again.");
        }
      } catch {
        flash("Network error. Please try again.");
      } finally {
        setBusy(false);
      }
    } else {
      setMethod(config);
    }
  };

  const applyPromo = async () => {
    if (!signedIn) return router.push("/login");
    if (!promo.trim() || applying) return;
    setApplying(true);
    try {
      const res = await fetch("/api/promo/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promo.trim(), packageId: selected }),
      });
      const data = await res.json();
      if (!data?.success) {
        flash(PROMO_ERRORS[data?.error] ?? "Couldn't apply this code.");
      } else if (data.mode === "coins") {
        await refresh();
        setAppliedPromo(null);
        setPromo("");
        flash(`Promo applied · +${data.coins} coins added 🎉`);
      } else if (data.mode === "discount") {
        setAppliedPromo({
          code: promo.trim().toUpperCase(),
          promocodeId: data.promocode_id,
          discountPercent: Number(data.discount_percent),
          finalPrice: Number(data.final_price),
          originalPrice: Number(data.original_price),
          packageId: data.package_id,
        });
        flash(`Code applied · ${data.discount_percent}% off this pack`);
      }
    } catch {
      flash("Network error. Please try again.");
    } finally {
      setApplying(false);
    }
  };

  if (!pkg) {
    return <div className="py-24 text-center text-gray-400">No coin packages available.</div>;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 pb-28 sm:px-6 md:pb-10">
      <div className="relative overflow-hidden rounded-3xl forest p-6 text-white shadow-card sm:p-8">
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-gold-400/25 blur-2xl" />
        <p className="text-sm text-brand-100">Your balance</p>
        <div className="mt-1 flex items-center gap-2">
          <Coins className="h-8 w-8 text-gold-300" />
          <span className="font-serif text-4xl font-semibold">{signedIn ? coins : "—"}</span>
          <span className="text-brand-100">coins</span>
        </div>
        {need > 0 && coins < need && (
          <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm text-gold-200">
            <Sparkles className="h-4 w-4" /> You need {need - coins} more coins to unlock that book.
          </p>
        )}
      </div>

      <h2 className="mt-10 display text-2xl text-gray-900 sm:text-3xl">Choose a coin pack</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {packages.map((p) => {
          const active = selected === p.id;
          return (
            <button
              key={p.id}
              onClick={() => setSelected(p.id)}
              className={cn(
                "relative rounded-3xl border-2 p-5 text-left transition",
                active ? "border-brand bg-brand-50 shadow-card" : "border-gray-100 hover:border-brand-200"
              )}
            >
              {p.popular && (
                <span className="absolute -top-2.5 left-5 flex items-center gap-1 rounded-full bg-gold-400 px-2.5 py-0.5 text-[10px] font-bold uppercase text-brand-800">
                  <Star className="h-3 w-3 fill-current" /> Popular
                </span>
              )}
              {active && (
                <span className="absolute right-4 top-4 grid h-6 w-6 place-items-center rounded-full bg-brand text-white">
                  <Check className="h-4 w-4" />
                </span>
              )}
              <p className="text-sm font-medium text-gray-500">{p.name}</p>
              <div className="mt-2 flex items-baseline gap-1">
                <Coins className="h-5 w-5 text-gold-500" />
                <span className="font-serif text-3xl font-semibold text-gray-900">{p.coin_amount}</span>
              </div>
              {p.bonus_coins > 0 && <p className="mt-1 text-xs font-semibold text-brand-600">+ {p.bonus_coins} bonus coins</p>}
              {discountFor(p.id) ? (
                <p className="mt-3 flex flex-wrap items-baseline gap-x-2">
                  <span className="text-lg font-semibold text-brand-700">{p.currency} {priceOf(p).toLocaleString()}</span>
                  <span className="text-sm text-gray-400 line-through">{p.currency} {p.price.toLocaleString()}</span>
                  <span className="rounded-full bg-brand-50 px-1.5 py-0.5 text-[10px] font-bold text-brand-600">−{discountFor(p.id)!.discountPercent}%</span>
                </p>
              ) : (
                <p className="mt-3 text-lg font-semibold text-gray-900">{p.currency} {p.price.toLocaleString()}</p>
              )}
            </button>
          );
        })}
      </div>

      <h2 className="mt-10 display text-2xl text-gray-900 sm:text-3xl">Payment method</h2>
      <p className="text-sm text-gray-500">Showing options available in your country ({country}).</p>
      <div className="mt-4 space-y-3">
        {/* Card (Stripe Elements) — always available */}
        <button
          onClick={() => (signedIn ? setShowCard(true) : router.push("/login"))}
          className="flex w-full items-center gap-4 rounded-2xl border border-gray-200 p-4 text-left transition hover:border-brand hover:bg-brand-50/40"
        >
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600">
            <CreditCard className="h-5 w-5" />
          </span>
          <div className="flex-1">
            <p className="font-semibold text-gray-900">Credit / Debit Card</p>
            <p className="line-clamp-1 text-xs text-gray-500">Pay securely with Visa, Mastercard or Amex — instant coins.</p>
          </div>
          <span className="hidden rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white sm:inline">
            Pay {pkg.currency} {priceOf(pkg).toLocaleString()}
          </span>
        </button>

        {/* JazzCash / EasyPaisa etc. from payment_configs */}
        {configs.filter((c) => c.provider !== "stripe").map((c) => (
          <button
            key={c.id}
            onClick={() => pay(c)}
            disabled={busy}
            className="flex w-full items-center gap-4 rounded-2xl border border-gray-200 p-4 text-left transition hover:border-brand hover:bg-brand-50/40 disabled:opacity-60"
          >
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600">
              <QrCode className="h-5 w-5" />
            </span>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">{c.display_name}</p>
              <p className="line-clamp-1 text-xs text-gray-500">{c.description}</p>
            </div>
            <span className="hidden rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white sm:inline">
              Pay {pkg.currency} {priceOf(pkg).toLocaleString()}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-8 rounded-3xl bg-white p-6 shadow-soft ring-1 ring-brand-100/50">
        <h3 className="flex items-center gap-2 font-serif text-lg font-semibold text-gray-900">
          <Ticket className="h-5 w-5 text-gold-500" /> Have a promocode?
        </h3>

        {appliedPromo ? (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-brand-50 px-4 py-3 ring-1 ring-brand-100">
            <p className="flex items-center gap-2 text-sm font-semibold text-brand-800">
              <Check className="h-4 w-4 text-brand-600" />
              <span className="rounded-md bg-white px-2 py-0.5 font-mono text-brand-700">{appliedPromo.code}</span>
              {appliedPromo.discountPercent}% off applied — pay {pkg.currency} {appliedPromo.finalPrice.toLocaleString()}
            </p>
            <button onClick={() => { setAppliedPromo(null); setPromo(""); }} className="text-sm font-semibold text-gray-500 hover:text-rose-500">Remove</button>
          </div>
        ) : (
          <div className="mt-3 flex gap-2">
            <input
              value={promo}
              onChange={(e) => setPromo(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyPromo()}
              placeholder="Enter code e.g. WELCOME50"
              className="flex-1 rounded-full border border-gray-200 bg-white px-4 py-3 text-sm uppercase outline-none focus:border-brand"
            />
            <button onClick={applyPromo} disabled={applying || !promo.trim()} className="flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:opacity-50">
              {applying ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
            </button>
          </div>
        )}
        <p className="mt-2 text-xs text-gray-400">Coin codes are added instantly · discount codes apply to your selected pack at checkout.</p>
      </div>

      <p className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400">
        <ShieldCheck className="h-4 w-4" /> Payments are secured. Coins never expire.
      </p>

      {method && <ManualPaymentModal config={method} pkg={pkg} amount={priceOf(pkg)} onClose={() => setMethod(null)} onDone={(m) => { setMethod(null); flash(m); }} />}

      {showCard && (
        <StripeCardModal
          pkg={pkg}
          promoCode={activePromoCode}
          onClose={() => setShowCard(false)}
          onSuccess={async (m) => { setShowCard(false); setAppliedPromo(null); setPromo(""); await refresh(); flash(m); }}
        />
      )}

      {toast && (
        <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full bg-brand-700 px-5 py-3 text-sm font-medium text-white shadow-xl md:bottom-8">
          {toast}
        </div>
      )}
    </div>
  );
}

function ManualPaymentModal({ config, pkg, amount, onClose, onDone }: { config: PaymentConfig; pkg: CoinPackage; amount?: number; onClose: () => void; onDone: (msg: string) => void }) {
  const payable = amount ?? pkg.price;
  const [ref, setRef] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pickFile = (f: File | null) => {
    setError(null);
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
  };

  const submit = async () => {
    if (submitting || (!ref.trim() && !file)) return;
    setSubmitting(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("packageId", pkg.id);
      fd.append("provider", config.provider);
      fd.append("reference", ref.trim());
      if (file) fd.append("screenshot", file);
      const res = await fetch("/api/payment/manual-proof", { method: "POST", body: fd });
      const data = await res.json();
      if (data.ok) {
        onDone("Payment proof submitted — we'll verify it and add your coins soon. 💛");
      } else {
        setError(
          data.error === "proof_required" ? "Add a transaction ID or a screenshot first."
          : data.error === "upload_failed" ? "Couldn't upload the screenshot. Try a smaller image."
          : "Couldn't submit. Please try again."
        );
        setSubmitting(false);
      }
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4" onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-md animate-fade-up overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-serif text-xl font-semibold text-gray-900">{config.display_name}</h3>
        <p className="mt-1 text-sm text-gray-500">{config.description}</p>

        <div className="mt-4 rounded-2xl border border-gray-100 p-4 text-center">
          {/* QR code pulled from payment_configs.qr_code_url */}
          {config.qr_code_url ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={config.qr_code_url}
              alt={`${config.display_name} QR code`}
              className="mx-auto aspect-square w-full max-w-[18rem] rounded-2xl bg-white object-contain p-3 shadow-soft ring-1 ring-black/5"
            />
          ) : (
            <div className="mx-auto grid aspect-square w-full max-w-[18rem] place-items-center rounded-2xl bg-gradient-to-br from-brand-50 to-gold-50 text-brand-300">
              <QrCode className="h-24 w-24" />
            </div>
          )}
          <p className="mt-3 text-sm font-medium text-gray-700">Scan the QR, or pay to:</p>
          {config.account_details && (
            <p className="text-sm font-semibold text-gray-900">{config.account_details}</p>
          )}
          <p className="mt-1 text-lg font-bold text-brand-700">Send {pkg.currency} {payable.toLocaleString()}</p>
        </div>

        {/* Instructions */}
        <div className="mt-4 flex gap-2 rounded-2xl bg-gold-50 p-3.5 text-sm leading-relaxed text-brand-800 ring-1 ring-gold-200">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" />
          <span>
            After you pay, <b>send us the payment screenshot</b> below. We&apos;ll verify it and add
            the coins to your account so you can unlock the books you want. 💛
          </span>
        </div>

        <div className="mt-4 space-y-3">
          <input value={ref} onChange={(e) => setRef(e.target.value)} placeholder="Transaction ID / reference" className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-brand" />

          {preview ? (
            <div className="flex items-center gap-3 rounded-xl border border-gray-200 p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="Payment screenshot" className="h-16 w-16 shrink-0 rounded-lg object-cover ring-1 ring-black/5" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-800">{file?.name}</p>
                <p className="text-xs text-gray-400">{file ? Math.round(file.size / 1024) : 0} KB</p>
              </div>
              <button onClick={() => pickFile(null)} className="text-sm font-semibold text-gray-500 hover:text-rose-500">Remove</button>
            </div>
          ) : (
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 px-4 py-5 text-sm text-gray-500 hover:border-brand">
              <Upload className="h-5 w-5" /> Upload payment screenshot
              <input type="file" accept="image/*" className="hidden" onChange={(e) => pickFile(e.target.files?.[0] ?? null)} />
            </label>
          )}
        </div>

        {error && <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>}

        <button disabled={submitting || (!ref.trim() && !file)} onClick={submit} className="btn-green mt-5 flex w-full items-center justify-center gap-2 rounded-full py-3.5 font-semibold disabled:opacity-40">
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit payment proof"}
        </button>
        <p className="mt-2 text-center text-xs text-gray-400">Saves your screenshot + a pending transaction · admin verifies &amp; credits coins</p>
      </div>
    </div>
  );
}
