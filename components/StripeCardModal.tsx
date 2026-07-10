"use client";

import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { CreditCard, Loader2, ShieldCheck, X, Coins, Ticket, Check } from "lucide-react";
import type { CoinPackage } from "@/lib/types";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "");

const PROMO_ERRORS: Record<string, string> = {
  invalid: "Invalid promo code.",
  inactive: "This code is no longer active.",
  expired: "This code has expired.",
  not_started: "This code isn't active yet.",
  exhausted: "This code has reached its usage limit.",
  already_used: "You've already used this code.",
  not_applicable_to_package: "This code doesn't apply to this pack.",
  not_a_discount_code: "This code can't be used at checkout.",
};

const appearance = {
  theme: "stripe" as const,
  variables: {
    colorPrimary: "#0B5D4B",
    colorText: "#14211D",
    colorDanger: "#e11d48",
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif",
    borderRadius: "12px",
  },
};

export default function StripeCardModal({
  pkg,
  promoCode,
  onClose,
  onSuccess,
}: {
  pkg: CoinPackage;
  promoCode?: string;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [payAmount, setPayAmount] = useState<number>(pkg.price);
  const [error, setError] = useState<string | null>(null);

  // promo applied right here at checkout (for this package)
  const [appliedCode, setAppliedCode] = useState<string>(promoCode ?? "");
  const [promoInput, setPromoInput] = useState("");
  const [applyingPromo, setApplyingPromo] = useState(false);
  const [promoErr, setPromoErr] = useState<string | null>(null);
  const [discountPct, setDiscountPct] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/stripe/payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ packageId: pkg.id, promoCode: appliedCode || undefined }),
        });
        const data = await res.json();
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
          if (typeof data.amount === "number") setPayAmount(data.amount);
        } else {
          setError(data.error === "stripe_not_configured" ? "Card payments aren't set up yet." : (data.error ?? "Could not start payment."));
        }
      } catch {
        setError("Network error. Please try again.");
      }
    })();
  }, [pkg.id, appliedCode]);

  const coins = pkg.coin_amount + pkg.bonus_coins;
  const discounted = payAmount < pkg.price;

  const applyPromo = async () => {
    if (!promoInput.trim() || applyingPromo) return;
    setApplyingPromo(true);
    setPromoErr(null);
    try {
      const res = await fetch("/api/promo/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoInput.trim(), packageId: pkg.id }),
      });
      const data = await res.json();
      if (!data?.success) {
        setPromoErr(PROMO_ERRORS[data?.error] ?? "Couldn't apply this code.");
      } else if (data.mode === "coins") {
        // instant coin code → credit + close
        onSuccess(`Promo applied · +${data.coins} coins added 🎉`);
      } else if (data.mode === "discount") {
        setDiscountPct(Number(data.discount_percent));
        setClientSecret(null);            // re-init the intent at the discounted price
        setAppliedCode(promoInput.trim());
        setPromoInput("");
      }
    } catch {
      setPromoErr("Network error. Please try again.");
    } finally {
      setApplyingPromo(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4" onClick={onClose}>
      <div className="max-h-[92vh] w-full max-w-md animate-fade-up overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="flex items-center gap-2 font-serif text-xl font-semibold text-gray-900">
              <CreditCard className="h-5 w-5 text-brand-600" /> Pay with card
            </h3>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-500">
              <Coins className="h-4 w-4 text-gold-500" /> {coins} coins ·{" "}
              {discounted && <span className="text-gray-400 line-through">{pkg.currency} {pkg.price.toLocaleString()}</span>}{" "}
              <span className={discounted ? "font-semibold text-brand-700" : ""}>{pkg.currency} {payAmount.toLocaleString()}</span>
              {discounted && <span className="rounded-full bg-brand-50 px-1.5 py-0.5 text-[10px] font-bold text-brand-600">PROMO</span>}
            </p>
          </div>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full text-gray-400 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Have a promo code? — applied to THIS package at checkout */}
        <div className="mb-4">
          {appliedCode && discounted ? (
            <div className="flex items-center justify-between gap-2 rounded-xl bg-brand-50 px-3.5 py-2.5 text-sm ring-1 ring-brand-100">
              <span className="flex items-center gap-2 font-semibold text-brand-800">
                <Check className="h-4 w-4 text-brand-600" />
                <span className="rounded-md bg-white px-1.5 py-0.5 font-mono text-brand-700">{appliedCode}</span>
                {discountPct ?? ""}% off
              </span>
              <button onClick={() => { setAppliedCode(""); setDiscountPct(null); setClientSecret(null); }} className="text-xs font-semibold text-gray-500 hover:text-rose-500">Remove</button>
            </div>
          ) : (
            <>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Ticket className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gold-500" />
                  <input
                    value={promoInput}
                    onChange={(e) => { setPromoInput(e.target.value); setPromoErr(null); }}
                    onKeyDown={(e) => e.key === "Enter" && applyPromo()}
                    placeholder="Have a promo code?"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-9 pr-3 text-sm uppercase outline-none focus:border-brand focus:bg-white"
                  />
                </div>
                <button onClick={applyPromo} disabled={applyingPromo || !promoInput.trim()} className="rounded-xl bg-brand px-5 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:opacity-50">
                  {applyingPromo ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
                </button>
              </div>
              {promoErr && <p className="mt-1.5 text-xs font-medium text-rose-600">{promoErr}</p>}
            </>
          )}
        </div>

        {error ? (
          <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</div>
        ) : !clientSecret ? (
          <div className="flex items-center justify-center gap-2 py-12 text-gray-400">
            <Loader2 className="h-5 w-5 animate-spin" /> Preparing secure form…
          </div>
        ) : (
          <Elements key={clientSecret} stripe={stripePromise} options={{ clientSecret, appearance }}>
            <CardForm amount={`${pkg.currency} ${payAmount.toLocaleString()}`} onSuccess={onSuccess} />
          </Elements>
        )}

        <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-gray-400">
          <ShieldCheck className="h-4 w-4" /> Secured by Stripe · test card 4242 4242 4242 4242
        </p>
      </div>
    </div>
  );
}

function CardForm({ amount, onSuccess }: { amount: string; onSuccess: (msg: string) => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setError(null);

    const { error: submitErr } = await elements.submit();
    if (submitErr) {
      setError(submitErr.message ?? "Please check your card details.");
      setLoading(false);
      return;
    }

    const { error: confirmErr, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
      confirmParams: { return_url: window.location.href },
    });

    if (confirmErr) {
      setError(confirmErr.message ?? "Payment failed.");
      setLoading(false);
      return;
    }

    if (paymentIntent?.status === "succeeded") {
      // credit coins server-side (idempotent)
      try {
        await fetch(`/api/stripe/verify-intent?pi=${paymentIntent.id}`);
      } catch {}
      onSuccess("Payment successful! Coins added to your balance. 🎉");
    } else {
      setError("Payment could not be completed.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <PaymentElement options={{ layout: "tabs" }} />
      {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>}
      <button
        type="submit"
        disabled={!stripe || loading}
        className="btn-green flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-semibold disabled:opacity-60"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : `Pay ${amount}`}
      </button>
    </form>
  );
}
