"use client";

import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { CreditCard, Loader2, ShieldCheck, X, Coins } from "lucide-react";
import type { CoinPackage } from "@/lib/types";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "");

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

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/stripe/payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ packageId: pkg.id, promoCode: promoCode || undefined }),
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
  }, [pkg.id, promoCode]);

  const coins = pkg.coin_amount + pkg.bonus_coins;
  const discounted = payAmount < pkg.price;

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

        {error ? (
          <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</div>
        ) : !clientSecret ? (
          <div className="flex items-center justify-center gap-2 py-12 text-gray-400">
            <Loader2 className="h-5 w-5 animate-spin" /> Preparing secure form…
          </div>
        ) : (
          <Elements stripe={stripePromise} options={{ clientSecret, appearance }}>
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
