# Build the ZaraSuno mobile app (React Native / Expo) — full brief

You are building the **native mobile version** (iOS + Android, for the App Store and
Google Play) of an existing web product called **ZaraSuno** — an audiobook &
book‑summary platform (English + Urdu) where users listen to samples for free and
**unlock full books with coins** they buy. The web app already exists (Next.js) and
runs on a **Supabase** backend. **You must reuse that same Supabase project and its
existing hosted API — do not build a new backend or a new database.** Match the web
app's features, flows, and visual identity as closely as native patterns allow.

---

## 0. Golden rules (read first)

1. **Same Supabase project.** All data lives there already (tables, RLS, RPCs,
   storage buckets, auth users). Use the **anon key** on the device for everything
   that RLS allows (reads and the user's own writes). Never ship the service‑role key
   in the app.
2. **Privileged operations already have a hosted backend** — the web app's Next.js
   **API routes** (deployed on Vercel) that use the service‑role key. **Reuse them**
   from the mobile app by calling their URLs. Do NOT reimplement them with the
   service key on device. These cover: audio signed‑URL, Stripe, manual‑payment
   upload, promo apply, register. (List in §7.)
3. **Parity, not redesign.** Keep the same information architecture, wording, and
   color system. It should feel like the same brand.
4. TypeScript everywhere. Clean, typed, production‑quality code.

**Recommended stack:** Expo (managed) + expo-router, TypeScript, `@supabase/supabase-js`
v2, `@stripe/stripe-react-native` (PaymentSheet), `expo-av` (audio) or
`react-native-track-player` (better for background audio + lock‑screen controls),
`expo-secure-store` (session), `@tanstack/react-query` (data), `expo-image`,
`react-native-reanimated`, `expo-notifications`. Use EAS Build for store binaries.

---

## 1. Design system (match the web exactly)

**Fonts**
- Body / UI: **Plus Jakarta Sans** (weights 400/500/600/700/900).
- Display / headings: **Fraunces** (serif) — used for titles, big headings, prices.

**Color palette** (hex — use these tokens app‑wide):

```
brand (deep green — primary):
  DEFAULT #0B5D4B
  50 #E8F0EA  100 #CFE1D5  200 #A3C6B2  300 #6FA88E  400 #3C8A6A
  500 #0B5D4B 600 #0A5041  700 #083E33  800 #052C24  900 #031D18

gold (accent — CTAs, coins, highlights):
  DEFAULT #D9A94C
  50 #FAF3E0  100 #F3E4BC  200 #EACF8C  300 #E1BB5E  400 #D9A94C
  500 #BE8E30 600 #98701F

clay (warm secondary):
  DEFAULT #C97B57  50 #F7ECE5  100 #EBD2C4  200 #DCAF97

cream #F2E9D5   ivory #F7F3EA   surface/white #FFFFFF
```

**Usage**
- App background: white / ivory. Dark surfaces (hero, headers, footers, FAQ): the
  `brand-900 → brand-800` green gradient with a subtle mesh/grain overlay.
- Primary buttons / coins / prices: **gold** (a gold gradient looks best), text on
  gold is `brand-900`.
- Pills / chips: white on green surfaces; `brand-50` fills with `brand-700` text on
  light surfaces; active state = solid `brand-900` with white text.
- Cards: white, rounded‑2xl/3xl, soft green‑tinted shadow, `ring-1` hairline border.
- Rounded corners are generous (16–28px). Lots of soft shadows and glows.
- Support **light + dark**; if time‑boxed, ship a polished light theme first.

**Brand marks (reuse the web assets):** the ZaraSuno logo is a gold wordmark with a
"book + play" glyph. App icon / favicon is that book‑play glyph on transparent; the
iOS tile is the same glyph on a solid **white** background. Ask the owner for
`goldenlogo.png`, `favicon.png` (512), `apple-icon.png` (512, white tile) from the
web repo's `public/images/`. Use them for the launcher icon and splash.

---

## 2. Supabase — connection & schema

Env the app needs (public only):
```
EXPO_PUBLIC_SUPABASE_URL=<same as web NEXT_PUBLIC_SUPABASE_URL>
EXPO_PUBLIC_SUPABASE_ANON_KEY=<same as web NEXT_PUBLIC_SUPABASE_ANON_KEY>
EXPO_PUBLIC_API_BASE_URL=<the deployed web app origin, e.g. https://zarasuno.app>  # for the API routes in §7
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=<Stripe pk_live_...>
```
Create a Supabase client with `@supabase/supabase-js`, `persistSession: true`,
`autoRefreshToken: true`, storage = `expo-secure-store` adapter. RLS is already
enforced, so the anon key only ever returns/writes the current user's own rows.

### Tables (already exist — do not recreate)
- **profiles** — the user (id = auth uid), `full_name`, `email`, **`coin_balance`**,
  `country`, admin flag. Created automatically on signup by a trigger.
- **books** — `title, subtitle, description, cover_url, author_id` (+ `author_2_id..author_4_id` co‑authors), `subcategory_id`, `language_code`, `coin_price`, `is_free`, `is_locked`, `duration_seconds`, `chapter_count`, `listen_count`, `book_type` ('summary'|'audiobook'|'ebook'), `is_book_of_month`, `is_book_of_day`, `is_published`, `created_at`.
- **chapters** — `book_id, chapter_number, title, audio_path` (path in PRIVATE bucket), `duration_seconds`, `is_preview` (chapter 1 is the free preview).
- **authors** — `id, name, avatar_url, bio`.
- **categories** / **subcategories** — `name, slug, icon_url, sort_order, is_active`; subcategory has `category_id`.
- **languages** — `code` ('en','ur','hi'), `name`.
- **home_carousels** / **carousel_books** — admin‑curated home rows (`type`, `title`, `language_code`, `sort_order`, `is_active`) and their book membership.
- **hero_features** — admin‑selected book shown in the landing hero with a ~1‑min audio sample: `book_id`, `sample_audio_url` (public, in `hero-samples` bucket), `sample_label`, `is_active`, `sort_order`.
- **coin_packages** — buyable packs: `name`, `coin_amount`, `bonus_coins`, `price`, `currency`, `is_active`, `sort_order`.
- **coin_package_prices** — optional per‑country price overrides.
- **transactions** — coin ledger: `user_id`, `type` ('purchase'|'spend'|'admin_grant'|'promo'|'refund'), **`coin_change`** (signed int), `amount`, `currency`, `package_id`, `book_id`, `payment_provider` ('stripe'|'jazzcash'|'easypaisa'|'manual'|'none'|'promo'), `payment_status` ('pending'|'completed'|'failed'|'refunded'), `payment_reference`, `payment_proof_url`, **`promocode_id`**, `created_at`.
- **book_unlocks** — which books a user permanently owns (`user_id`, `book_id`).
- **listening_progress** — resume position per user/book (`position_seconds`, `chapter_id`, updated_at).
- **favourites** — user's saved books.
- **user_categories** / **user_languages** — the interests/languages the user picked at onboarding (drive Recommended + language‑gated rows).
- **promocodes** — `code`, `reward_type` ('coins'|'discount'), `coin_reward`, `discount_percent`, `max_uses`, `used_count`, `per_user_limit`, `expires_at`, `is_active`.
- **promocode_redemptions** — one row per use (`promocode_id`, `user_id`, unique per pair). **Influencer usage/revenue is counted from here + `transactions.promocode_id`.**
- **notifications** — in‑app notifications (`title`, `body`, `is_read`, `created_at`); realtime‑enabled.
- **payment_configs** — enabled manual methods (JazzCash/EasyPaisa) with account name/number + QR image.
- **content_pages** — Terms / Privacy / FAQ HTML. **app_settings** — key/value jsonb (brand, `socials`, etc.). **feedback** — user feedback.

### RPCs (call with `supabase.rpc(...)`)
- **`unlock_book_with_coins(p_book_id uuid)`** → json. Atomically checks balance,
  deducts `coin_price`, inserts `book_unlocks` + a `spend` transaction. Returns
  success or `insufficient_coins`. **Use this to unlock a book.**
- **`apply_promocode(p_code text, p_package_id uuid)`** → jsonb. For a **coin‑reward**
  code it credits coins immediately + records a redemption; for a **discount** code it
  returns the discounted price + `promocode_id` to carry into checkout.
- **`validate_discount_promo(p_code text, p_package_id uuid)`** → jsonb `{ success,
  discount_percent, final_price, original_price, promocode_id }`. Preview a discount.
- **`credit_coin_purchase(p_user_id, p_coins, p_amount, p_package_id, p_reference,
  p_promocode_id)`** — server‑side only (called by the API routes) to credit a paid
  purchase idempotently, stamp `promocode_id`, and record the redemption. **Do not
  call from the device.**
- **`increment_listen_count(p_book_id uuid)`** — fire‑and‑forget play counter.

### Storage buckets
- `book-covers` (public), `authors` (public), `avatars` (public), `category-icons`
  (public), `payment-qr` (public), `hero-samples` (public, the 1‑min samples).
- **`book-audio` (PRIVATE)** — full chapter audio. Never read directly; get a
  short‑lived signed URL from the audio API route (§7).
- `payment-proofs` (private) — manual payment screenshots (uploaded via API route).

---

## 3. Auth & onboarding

- **Email + password** sign up / sign in via Supabase Auth. Sign‑up also hits the
  web **`/api/auth/register`** route (it sends the welcome email / any extra setup) —
  or just use `supabase.auth.signUp` and rely on the DB trigger that creates the
  profile; confirm which the web uses and mirror it.
- **Google OAuth** — use `supabase.auth.signInWithOAuth` with an Expo deep link
  redirect (`makeRedirectUri`) + `expo-web-browser`. Configure the scheme and add the
  redirect URL to Supabase Auth settings.
- **Password reset** via email deep link.
- **Onboarding (first run, after signup):** ask the user to pick **interest
  categories** (writes `user_categories`) and **languages** (writes `user_languages`).
  These personalize the home feed. Also set `profiles.country` (from device region;
  used for pricing).
- **Guest browsing allowed.** Signed‑out users can browse, search, and play free
  previews. When a guest tries to unlock/buy, route them through sign‑up and then
  **return them to the exact book/coins screen they came from** (preserve intent).

---

## 4. Navigation & screens

Bottom tab bar (signed‑in): **Home · Explore · Library · Profile**. A **Coins**
balance chip lives in the header (tap → Coins screen). Signed‑out shows a Sign‑in CTA.

Screens:
1. **Home** (feed) 2. **Explore** (search) 3. **Library** 4. **Profile**
5. **Coins / Buy coins** 6. **Book detail** 7. **Player (listen)** 8. **Author**
9. **Browse by author (A–Z)** 10. **Notifications** 11. **Auth (sign in / up /
reset)** 12. **Onboarding** 13. **Content pages** (Terms / Privacy / FAQ).

---

## 5. Feature specs (mirror the web)

### Home feed (order matters)
Signed‑in feed, top → bottom:
1. **Books of the Month** carousel.
2. **Recommended for you** — books mixed from the user's selected categories,
   **reshuffled weekly** (deterministic seed = week number), auto‑includes new picks
   when a category is added and drops all of a category's books when it's removed.
3. **Featured Books** band (admin images from `featured`/carousels).
4. Remaining admin carousels (Most Popular, Recently Added, language rows — a
   language row is hidden unless the user selected that language).
5. **Popular authors** — horizontal avatars (cap ~12) + a **"See more"** button →
   the A–Z "Browse by author" screen.
6. **Browse by interest** — categories → subcategories → books.

Signed‑out (landing) additionally shows a hero with a **phone/player card** featuring
the admin‑selected **hero_features** book: real cover/title/author, a **play button
for the 1‑min sample**, and an **"Explore this full book"** button → that book's
detail. Below the feed: **Browse by interest → "Why ZaraSuno?" → testimonials → FAQ**.
(For mobile you can simplify the marketing sections, but keep the hero sample player.)

Books of the Month, Recommended, and language‑gating logic already exist in the web
`getHomeSections` query — replicate the same shaping against Supabase.

### Explore (search)
Search input (matches **title / author / category / subcategory**). Category chips →
subcategory chips → results grid. Two quick filters: **"Full book"**
(`book_type = 'audiobook'`) and **"For children"** (category/subcategory name matches
/child|kid/i). Placeholder text: "Search by book, author, or keywords."

### Book detail
Cover, title, author(s) (tappable → Author screen), category, rating (derived),
duration, description, chapter list. Primary action depends on state:
- **Free or already unlocked** → "Listen now" (open Player).
- **Locked** → "Unlock for N coins". Tapping calls `unlock_book_with_coins`. If the
  user lacks coins → send to Coins with `need = price` and the book id, so after they
  buy they return here and finish unlocking. Guests → sign‑up first, then back here.
- Ebook type → open/download the ebook via the **`/api/ebook`** route.
- Fire `increment_listen_count(book_id)` once per view (guard against double count).

### Player (listen)
- Get audio via the **`/api/audio?chapter=<id>`** route which returns a **short‑lived
  signed URL** (only if the chapter is a preview, the book is free, or the user
  unlocked it). Stream that URL.
- Full transport: play/pause, ±15s, next/prev chapter, scrubber with real time,
  playback speed, **background playback + lock‑screen / notification controls**
  (use `react-native-track-player`).
- **Save resume position** to `listening_progress` (throttled) and resume on reopen.
- First chapter is always a free preview even when locked; other chapters 403 until
  unlocked (surface an "Unlock to continue" prompt).

### Coins & payments  ← see §6 for the important store‑policy caveat
- List **coin_packages** (active, sorted). Show coins + bonus + **price in the user's
  local currency** (per‑country override from `coin_package_prices`, else live FX
  conversion from base currency using the country). Highlight a "best value" pack.
- **Balance card** at top + a **Wallet history** list (from `transactions`, newest
  first): coin purchases (`+N coins`, amount/currency, time) and unlocks
  (`Unlocked · <book title>`, `−N coins`, time). Join `books(title)` for unlock rows.
- **Promo codes:** input → `apply_promocode`. Coin‑reward codes credit instantly;
  discount codes apply a % off the selected pack (show original vs discounted).
- **Purchase methods:**
  - **Card (Stripe)** — on mobile use **Stripe PaymentSheet**: call
    **`/api/stripe/payment-intent`** (body: packageId, promoCode) to get a client
    secret (it stores `promocode_id` in metadata), present PaymentSheet with the
    publishable key, then call **`/api/stripe/verify-intent`** to confirm + credit.
    Do NOT use the web `/api/stripe/checkout` (that's a hosted‑web redirect).
  - **JazzCash / EasyPaisa (manual)** — read `payment_configs` for account details +
    QR. User uploads a payment screenshot via **`/api/payment/manual-proof`**
    (multipart: packageId, provider, reference, promoCode, screenshot). This records a
    **pending** transaction (with `promocode_id`) that an admin approves later.
- After any successful credit, refresh `coin_balance` and, if the user came to buy for
  a specific book, return them to that book and finish the unlock.

### Library
Tabs/sections: **Unlocked** (from `book_unlocks`), **Continue listening** (from
`listening_progress`, with progress bars), **Favourites** (from `favourites`). Empty
states with a CTA to Explore.

### Profile
- Header with name/email + coin balance.
- **Interests** (edit `user_categories`) and **Languages** (edit `user_languages`).
- **Wallet** — same transaction history as Coins.
- **Notifications** — list from `notifications`, mark read; realtime new‑item updates
  via a Supabase channel. Also wire **push notifications** (expo-notifications) for
  new‑book alerts if time allows.
- Country selector (affects pricing). Links to Terms / Privacy / FAQ
  (`content_pages`). **Sign out.**

### Authors
- **Author screen** — "Books by {name}" grid (a book counts if the author is primary
  OR any co‑author `author_2_id..author_4_id`).
- **Browse by author** — all authors with ≥1 published book, **grouped A–Z** with big
  letter headers and a sticky A–Z quick‑jump. Tap an author → Author screen.

---

## 6. ⚠️ App Store / Play Store payment policy — decide up front

Apple (and Google) generally require **in‑app purchase (IAP)** for **digital goods
consumed inside the app** — and coins that unlock books are digital goods. Selling
coins with **Stripe card payments inside the iOS app risks App Store rejection.**
Plan for this explicitly with the owner:

- **Recommended:** implement **StoreKit / Google Play Billing IAP** for coin packs on
  mobile (e.g. via **RevenueCat** or `expo-in-app-purchases`/`react-native-iap`). On a
  successful IAP, credit coins server‑side (add a small verify‑receipt endpoint that
  calls `credit_coin_purchase`). Keep Stripe for the **web** only.
- **Manual methods (JazzCash/EasyPaisa)** are local bank‑style transfers; confirm each
  store's stance for your region before relying on them in‑app.
- If the client insists on Stripe‑only on mobile, they must accept the rejection risk,
  or gate coin buying to the web with an external link (which Apple also restricts).

**Do not silently ship Stripe‑for‑coins on iOS without flagging this.** Surface it,
get a decision, and implement accordingly. (Reads/browsing/listening are fine; it's
only the *purchase of coins* that triggers the IAP rule.)

---

## 7. Reuse these existing hosted API routes (service‑role backend)

Base URL = `EXPO_PUBLIC_API_BASE_URL`. Send the user's Supabase access token as
`Authorization: Bearer <token>` where the route needs the user.

| Route | Method | Purpose |
|---|---|---|
| `/api/audio?chapter=<id>` | GET | Signed URL for a chapter's private audio (after access check). |
| `/api/ebook?...` | GET | Signed URL / download for ebook‑type books. |
| `/api/stripe/payment-intent` | POST | Create a PaymentIntent for a pack (+ promo) → client secret. **Use for mobile PaymentSheet.** |
| `/api/stripe/verify-intent` | POST | Verify the PaymentIntent + credit coins (idempotent). |
| `/api/stripe/webhook` | POST | Stripe → server credit (already handles credit). |
| `/api/payment/manual-proof` | POST (multipart) | Upload JazzCash/EasyPaisa screenshot → pending transaction. |
| `/api/promo/apply` | POST | Apply a promo code (wraps `apply_promocode`). |
| `/api/auth/register` | POST | Post‑signup setup / welcome email. |

If the team prefers, these can later be ported to **Supabase Edge Functions**, but for
v1 **just call the already‑deployed web routes** — zero backend rewrite.

Everything else (browsing, search, library, unlock, favourites, progress,
notifications, promo validate, reading balance/transactions) the app does **directly
against Supabase with the anon key** under RLS.

---

## 8. Non‑functional / polish
- Branded **loading state**: a spinning book‑play mark with a 1→100 % counter (matches
  the web loader). Use it for full‑screen loads.
- Skeletons for lists/cards; pull‑to‑refresh; optimistic favourite toggles.
- Offline‑friendly where reasonable (cache last feed; downloaded unlocked chapters is a
  nice‑to‑have via track‑player).
- Accessibility: dynamic type, sufficient contrast, labels on icon buttons.
- Analytics/error reporting (Sentry) optional but recommended.

## 9. Store readiness
- **Expo EAS Build** for both platforms. App icon + splash from the ZaraSuno mark
  (gold glyph; white background tile for iOS). Bundle IDs, versioning.
- Permissions: audio background mode (iOS `UIBackgroundModes: audio`), notifications,
  network. Privacy manifest / data‑safety form (they collect email, purchases).
- Deep‑link scheme for OAuth + password reset + "open book" links.
- Provide Terms & Privacy (from `content_pages`) — required by both stores.

## 10. Deliverables
1. Expo React Native app (TypeScript) implementing every screen/feature above.
2. Wired to the **existing** Supabase project (anon key) + the hosted API routes.
3. Stripe PaymentSheet **and/or** IAP for coins per the §6 decision; promo codes;
   manual payment upload; wallet history.
4. Matching color system, fonts, and brand marks.
5. EAS build config ready for TestFlight + Play Console internal testing.
6. A short README: env vars, how to run, how audio/payments are wired, and the §6
   store‑policy decision that was made.

**Acceptance:** a user can sign up, pick interests, browse the personalized feed,
search, play a free sample, buy coins (per the chosen payment method), unlock a full
book, listen with background controls, resume progress, see their wallet history, and
manage their profile — all against the same live Supabase data the web app uses.

> Ask the owner for: the Supabase URL + anon key, the deployed web API base URL, the
> Stripe publishable key, and the brand image assets (logo, favicon, apple‑icon) from
> the web repo's `public/images/`. Never request or embed the service‑role or Stripe
> secret keys in the app.
