// Mirrors content_pages (slug -> title/body). Swap for a Supabase read later.
export const CONTENT_PAGES: Record<string, { title: string; body: string }> = {
  terms: {
    title: "Terms of Service",
    body: `
      <p>Welcome to ZaraSuno. By using our app and website you agree to these terms.</p>
      <h3>1. Accounts</h3>
      <p>You are responsible for keeping your account credentials secure. One account per person.</p>
      <h3>2. Coins &amp; Purchases</h3>
      <p>Coins are a virtual currency used to unlock audiobooks. Coins are non-refundable and have no cash value. Unlocked books remain in your library.</p>
      <h3>3. Content</h3>
      <p>All audiobooks and summaries are licensed for personal, non-commercial listening only. Redistribution is prohibited.</p>
      <h3>4. Changes</h3>
      <p>We may update these terms from time to time. Continued use constitutes acceptance.</p>
    `,
  },
  privacy: {
    title: "Privacy Policy",
    body: `
      <p>Your privacy matters to us. This policy explains what we collect and why.</p>
      <h3>Information we collect</h3>
      <p>Account details (name, email), listening history, and payment records needed to provide the service.</p>
      <h3>How we use it</h3>
      <p>To personalize recommendations, process coin purchases, and improve the app. We never sell your data.</p>
      <h3>Your rights</h3>
      <p>You can edit your profile or delete your account at any time from the Profile screen.</p>
    `,
  },
  faq: {
    title: "Frequently Asked Questions",
    body: `
      <h3>What is ZaraSuno?</h3>
      <p>An audiobook and book-summary platform in English and Urdu. Listen chapter by chapter, anywhere.</p>
      <h3>How do coins work?</h3>
      <p>Buy coin packs, then spend coins to permanently unlock any book. Some books are free.</p>
      <h3>Can I listen offline?</h3>
      <p>Yes — once you unlock a book you can download its chapters for offline listening.</p>
      <h3>Which payment methods are supported?</h3>
      <p>Card payments via Stripe, plus JazzCash and EasyPaisa in Pakistan.</p>
      <h3>Do coins expire?</h3>
      <p>Never. Your coins and unlocked books stay with your account.</p>
    `,
  },
};
