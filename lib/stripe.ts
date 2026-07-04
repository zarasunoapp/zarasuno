import Stripe from "stripe";

// Server-side Stripe client. STRIPE_SECRET_KEY must never reach the browser.
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  typescript: true,
});
