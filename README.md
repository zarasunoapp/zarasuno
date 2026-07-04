# ZaraSuno — Public Website

Beautiful, mobile-first audiobook / book-summary web app (Next.js 14 + Tailwind).
Currently runs on **dummy data** so you can preview the full experience. When your
Supabase creds are ready, swap the data layer — the types already match the schema.

## Run

```bash
npm install
npm run dev
# open http://localhost:3000
```

## Try it out
- **Sign in** (top-right) to switch from the marketing landing to the personalized app home.
  After signing in you'll get the onboarding category picker.
- Open any **book** → unlock a locked book with coins (starts at 230) → **Listen** opens the player.
- Free books (green "Free" badge) are playable immediately.
- Visit **/coins**, **/library**, **/profile**, **/faq**, **/terms**, **/privacy**.
- Sign out from **Profile** to see the signed-out state again.

State is simulated in the browser (localStorage) via `lib/store.tsx`.

## Where the real Supabase goes later
| Dummy source | Real replacement |
|---|---|
| `lib/data.ts` arrays + helpers | `lib/queries/*.ts` calling Supabase |
| `lib/store.tsx` session sim | `@supabase/ssr` auth + `book_unlocks` / `favourites` / `profiles` |
| `lib/content.ts` | `content_pages` table |
| unlock button | `unlock_book_with_coins` RPC |
| player audio | `get-audio-url` edge function (signed URLs) |
| coins checkout | `stripe-checkout` / `submit-manual-payment` / `redeem-promocode` |

Brand: primary `#0B5D4B` · accent `#E0B84C`.
