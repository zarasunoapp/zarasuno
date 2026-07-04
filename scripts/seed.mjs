// Seeds every ZaraSuno table with demo content and creates a login user.
// Run: node --env-file=.env.local scripts/seed.mjs
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Missing env. Run with: node --env-file=.env.local scripts/seed.mjs");
  process.exit(1);
}

const db = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const DEMO_EMAIL = "demo@zarasuno.app";
const DEMO_PASSWORD = "ZaraSuno123!";

const cover = (s) => `https://picsum.photos/seed/${s}/600/600`;
const avatar = (n) => `https://i.pravatar.cc/200?img=${n}`;

// ---- deterministic-ish IDs so re-running keeps relations sane ----
const id = () => randomUUID();

async function up(table, rows, onConflict) {
  const { error } = await db.from(table).upsert(rows, onConflict ? { onConflict } : undefined);
  if (error) throw new Error(`${table}: ${error.message}`);
  console.log(`  ✓ ${table} (${rows.length})`);
}

async function main() {
  console.log("Seeding ZaraSuno…");

  // Languages
  await up("languages", [
    { code: "en", name: "English", is_active: true },
    { code: "ur", name: "Urdu", is_active: true },
    { code: "hi", name: "Hindi", is_active: true },
  ], "code");

  // Categories
  const cats = [
    { name: "Self Development", slug: "self-development", icon_url: "🌱", sort_order: 1 },
    { name: "Business & Money", slug: "business-money", icon_url: "💼", sort_order: 2 },
    { name: "Fiction", slug: "fiction", icon_url: "📖", sort_order: 3 },
    { name: "History & Society", slug: "history-society", icon_url: "🏛️", sort_order: 4 },
    { name: "Health & Mind", slug: "health-mind", icon_url: "🧠", sort_order: 5 },
    { name: "Spirituality", slug: "spirituality", icon_url: "🕊️", sort_order: 6 },
  ].map((c) => ({ id: id(), is_active: true, ...c }));
  await up("categories", cats, "slug");
  const C = Object.fromEntries(cats.map((c) => [c.slug, c.id]));

  // Subcategories
  const subsRaw = [
    ["self-development", "Habits & Productivity", "habits"],
    ["self-development", "Focus & Deep Work", "focus"],
    ["self-development", "Confidence", "confidence"],
    ["business-money", "Investing", "investing"],
    ["business-money", "Entrepreneurship", "entrepreneurship"],
    ["fiction", "Literary Fiction", "literary"],
    ["fiction", "Urdu Novels", "urdu-novels"],
    ["history-society", "World History", "world-history"],
    ["health-mind", "Mental Wellbeing", "wellbeing"],
    ["spirituality", "Mindfulness", "mindfulness"],
  ];
  const subs = subsRaw.map(([catSlug, name, slug], i) => ({
    id: id(), category_id: C[catSlug], name, slug, sort_order: i + 1, is_active: true,
  }));
  await up("subcategories", subs, "category_id,slug");
  const S = Object.fromEntries(subs.map((s) => [s.slug, s.id]));

  // Authors
  const authorsRaw = [
    ["James Clear", "James Clear is a writer and speaker focused on habits, decision-making, and continuous improvement.", 12],
    ["Morgan Housel", "Morgan Housel is a partner at Collaborative Fund who writes about the psychology of money.", 15],
    ["Cal Newport", "Cal Newport is a computer science professor at Georgetown and author on focus and technology.", 33],
    ["Yuval Noah Harari", "Yuval Noah Harari is a historian and bestselling author of Sapiens and Homo Deus.", 52],
    ["Brené Brown", "Brené Brown is a research professor studying courage, vulnerability, shame, and empathy.", 45],
    ["Matt Haig", "Matt Haig is the author of Reasons to Stay Alive and The Midnight Library.", 60],
    ["Robert Greene", "Robert Greene is the author of The 48 Laws of Power, Mastery, and The Laws of Human Nature.", 68],
    ["Ayesha Malik", "Ayesha Malik is a celebrated Urdu novelist rooted in South Asian heritage.", 25],
  ];
  const authors = authorsRaw.map(([name, bio, n]) => ({ id: id(), name, bio, avatar_url: avatar(n) }));
  await up("authors", authors);
  const A = Object.fromEntries(authors.map((a) => [a.name, a.id]));

  // Books
  const booksRaw = [
    ["Atomic Habits", "Tiny Changes, Remarkable Results", "No matter your goals, Atomic Habits offers a proven framework for improving every day. James Clear reveals practical strategies to form good habits, break bad ones, and master the tiny behaviors that lead to remarkable results.", "atomichabits", "James Clear", "habits", "en", 120, false, 19080, 8, 184320, true, true, "2026-06-20"],
    ["The Psychology of Money", "Timeless Lessons on Wealth & Greed", "Doing well with money isn't necessarily about what you know. It's about how you behave. Morgan Housel shares 19 short stories exploring the strange ways people think about money.", "psychmoney", "Morgan Housel", "investing", "en", 100, false, 21600, 9, 152980, true, false, "2026-06-25"],
    ["Deep Work", "Rules for Focused Success", "Deep work is the ability to focus without distraction on a cognitively demanding task. Cal Newport shows how to cultivate this skill and thrive in a distracted world.", "deepwork", "Cal Newport", "focus", "en", 90, false, 16200, 7, 98750, false, false, "2026-06-28"],
    ["Sapiens", "A Brief History of Humankind", "From the Stone Age to the Silicon Age, Yuval Noah Harari explores how an insignificant ape became the ruler of planet Earth.", "sapiens2", "Yuval Noah Harari", "world-history", "en", 150, false, 54000, 20, 245100, true, false, "2026-05-30"],
    ["Daring Greatly", "The Courage to Be Vulnerable", "Brené Brown challenges the belief that vulnerability is weakness and shows how embracing imperfection transforms how we live, love, and lead.", "daring", "Brené Brown", "confidence", "en", 0, true, 18900, 8, 67400, false, false, "2026-06-29"],
    ["The Midnight Library", "A Novel of Infinite Lives", "Between life and death there is a library, and within it the books are infinite. Nora Seed finds herself faced with the chance to make things right.", "midnight", "Matt Haig", "literary", "en", 80, false, 32400, 12, 133200, false, false, "2026-06-18"],
    ["The Laws of Human Nature", "Master the Art of Reading People", "Robert Greene draws on history's greatest figures to show us how to detach from our emotions and master self-control.", "humannature", "Robert Greene", "confidence", "en", 140, false, 61200, 18, 112050, false, false, "2026-06-10"],
    ["So Good They Can't Ignore You", "Why Skills Beat Passion", "Cal Newport argues that skills, mastery, and craftsmanship — not passion — are the real path to work you love.", "sogood", "Cal Newport", "entrepreneurship", "en", 70, false, 23400, 10, 54300, false, false, "2026-06-05"],
    ["Chand Raat", "چاند رات — ایک محبت کی کہانی", "Ayesha Malik ki likhi hui yeh kahani mohabbat, sabar, aur ummeed ke gird ghoomti hai.", "chandraat", "Ayesha Malik", "urdu-novels", "ur", 60, false, 28800, 11, 78900, false, false, "2026-06-22"],
    ["Homo Deus", "A Brief History of Tomorrow", "Yuval Noah Harari examines what happens when old myths meet new godlike technologies such as AI and genetic engineering.", "homodeus", "Yuval Noah Harari", "world-history", "en", 150, false, 48600, 16, 89600, false, false, "2026-05-20"],
    ["Reasons to Stay Alive", "A Story of Hope", "Matt Haig's moving, funny exploration of how to live better and feel more alive after depression nearly ended his life.", "reasons", "Matt Haig", "wellbeing", "en", 50, false, 14400, 6, 61200, false, false, "2026-06-27"],
    ["Mastery", "The Keys to Success and Fulfillment", "Robert Greene examines history's greatest masters to reveal the secrets of achieving mastery in any field.", "mastery", "Robert Greene", "entrepreneurship", "en", 110, false, 43200, 14, 74800, false, false, "2026-06-01"],
    ["The Almanack of Focus", "A Practical Guide to Deep Attention", "A curated set of principles and daily rituals to reclaim your attention in a world engineered for distraction.", "focusalmanack", "Cal Newport", "focus", "en", 40, false, 10800, 5, 33100, false, false, "2026-07-01"],
    ["Sukoon", "سکون — اندرونی سکون کا راستہ", "Zindagi ki bhaag daud mein apne andar sukoon dhoondne ka safar. Rooh ko taskeen dene wali kahaniyan.", "sukoon", "Ayesha Malik", "mindfulness", "ur", 0, true, 12600, 6, 45600, false, false, "2026-06-30"],
  ];
  const books = booksRaw.map((b) => ({
    id: id(), title: b[0], subtitle: b[1], description: b[2], cover_url: cover(b[3]),
    author_id: A[b[4]], subcategory_id: S[b[5]], language_code: b[6], coin_price: b[7],
    is_free: b[8], is_locked: !b[8], duration_seconds: b[9], chapter_count: b[10],
    listen_count: b[11], is_book_of_month: b[12], is_book_of_day: b[13], is_published: true,
    created_at: new Date(b[14]).toISOString(),
  }));
  await up("books", books);
  const bookByTitle = Object.fromEntries(books.map((b) => [b.title, b]));

  // Chapters
  const titles = ["The Foundation", "Building Momentum", "Deeper Patterns", "The Turning Point", "Putting It Together", "Beyond the Basics", "Real-World Practice", "Lasting Change", "The Long Game", "Mastery", "Reflection", "New Horizons"];
  const chapters = [];
  for (const b of books) {
    for (let i = 0; i < b.chapter_count; i++) {
      chapters.push({
        id: id(), book_id: b.id, chapter_number: i + 1,
        title: i === 0 ? "Introduction" : i === b.chapter_count - 1 ? "Final Thoughts" : `Chapter ${i + 1}: ${titles[i % titles.length]}`,
        audio_path: `${b.id}/chapter-${i + 1}.mp3`,
        duration_seconds: Math.round(b.duration_seconds / b.chapter_count),
        is_preview: i === 0,
      });
    }
  }
  await up("chapters", chapters, "book_id,chapter_number");

  // Home carousels (only DB-allowed types)
  await up("home_carousels", [
    { id: id(), title: "Books of the Month", type: "books_of_month", book_limit: 12, requires_auth: false, sort_order: 1, is_active: true },
    { id: id(), title: "Recommended for You", type: "recommended", book_limit: 12, requires_auth: true, sort_order: 3, is_active: true },
    { id: id(), title: "Most Popular", type: "most_popular", book_limit: 12, requires_auth: false, sort_order: 4, is_active: true },
    { id: id(), title: "Recently Added", type: "recently_added", book_limit: 12, requires_auth: false, sort_order: 5, is_active: true },
    { id: id(), title: "Self Development", type: "category", category_id: C["self-development"], book_limit: 12, requires_auth: false, sort_order: 6, is_active: true },
    { id: id(), title: "اردو کتابیں · Urdu Audiobooks", type: "language", language_code: "ur", book_limit: 12, requires_auth: false, sort_order: 7, is_active: true },
  ]);

  // Coin packages
  await up("coin_packages", [
    { id: id(), name: "Starter", coin_amount: 100, bonus_coins: 0, price: 199, currency: "PKR", is_active: true, sort_order: 1 },
    { id: id(), name: "Popular", coin_amount: 300, bonus_coins: 50, price: 499, currency: "PKR", is_active: true, sort_order: 2 },
    { id: id(), name: "Value", coin_amount: 600, bonus_coins: 150, price: 899, currency: "PKR", is_active: true, sort_order: 3 },
    { id: id(), name: "Pro", coin_amount: 1200, bonus_coins: 400, price: 1599, currency: "PKR", is_active: true, sort_order: 4 },
  ]);

  // Payment configs
  await up("payment_configs", [
    { id: id(), country: "PK", provider: "stripe", display_name: "Credit / Debit Card", description: "Pay securely with Visa, Mastercard or American Express via Stripe.", is_active: true, sort_order: 1 },
    { id: id(), country: "PK", provider: "jazzcash", display_name: "JazzCash", description: "Scan the QR with your JazzCash app, send the amount, then submit your transaction ID and screenshot below. Coins are credited after admin approval.", account_details: "0300-1234567 (ZaraSuno Pvt Ltd)", qr_code_url: cover("jazzcashqr"), is_active: true, sort_order: 2 },
    { id: id(), country: "PK", provider: "easypaisa", display_name: "EasyPaisa", description: "Scan the QR with your EasyPaisa app, send the amount, then submit your transaction ID and screenshot below. Coins are credited after admin approval.", account_details: "0345-7654321 (ZaraSuno Pvt Ltd)", qr_code_url: cover("easypaisaqr"), is_active: true, sort_order: 3 },
  ]);

  // Content pages
  await up("content_pages", [
    { slug: "terms", title: "Terms of Service", body: "<p>Welcome to ZaraSuno. By using our app you agree to these terms.</p><h3>Accounts</h3><p>Keep your credentials secure. One account per person.</p><h3>Coins &amp; Purchases</h3><p>Coins unlock audiobooks and are non-refundable with no cash value. Unlocked books stay in your library.</p><h3>Content</h3><p>All audio is licensed for personal, non-commercial listening only.</p>" },
    { slug: "privacy", title: "Privacy Policy", body: "<p>Your privacy matters. This policy explains what we collect and why.</p><h3>What we collect</h3><p>Account details, listening history, and payment records needed to run the service.</p><h3>How we use it</h3><p>To personalize recommendations and process purchases. We never sell your data.</p><h3>Your rights</h3><p>Edit your profile or delete your account any time from the Profile screen.</p>" },
    { slug: "faq", title: "Frequently Asked Questions", body: "<h3>What is ZaraSuno?</h3><p>An audiobook and book-summary platform in English and Urdu.</p><h3>How do coins work?</h3><p>Buy coin packs, then spend coins to permanently unlock any book. Some books are free.</p><h3>Can I listen offline?</h3><p>Yes — unlock a book and download its chapters.</p><h3>Do coins expire?</h3><p>Never.</p>" },
  ], "slug");

  // Promocodes
  await up("promocodes", [
    { id: id(), code: "WELCOME50", coin_reward: 50, max_uses: null, used_count: 0, per_user_limit: 1, is_active: true },
    { id: id(), code: "ZARA100", coin_reward: 100, max_uses: 500, used_count: 12, per_user_limit: 1, is_active: true },
  ], "code");

  // Broadcast notifications (user_id null)
  await up("notifications", [
    { id: id(), user_id: null, title: "New this month 🎉", body: "Atomic Habits and 3 more titles just landed in Books of the Month.", is_read: false },
    { id: id(), user_id: null, title: "Welcome to ZaraSuno", body: "Enjoy 50 free coins on us — start listening today!", is_read: false },
  ]);

  // ---- Demo auth user ----
  let userId;
  const { data: created, error: cErr } = await db.auth.admin.createUser({
    email: DEMO_EMAIL, password: DEMO_PASSWORD, email_confirm: true,
    user_metadata: { full_name: "Umar Q." },
  });
  if (cErr && !/registered|already/i.test(cErr.message)) throw cErr;
  if (created?.user) {
    userId = created.user.id;
  } else {
    const { data: list } = await db.auth.admin.listUsers();
    userId = list.users.find((u) => u.email === DEMO_EMAIL)?.id;
  }
  console.log(`  ✓ auth user ${DEMO_EMAIL} (${userId})`);

  // Give the demo user some state (profile is auto-created by the DB trigger)
  await db.from("profiles").update({
    full_name: "Umar Q.", coin_balance: 230, country: "PK",
    preferred_language: "en", onboarding_completed: true, role: "admin",
  }).eq("id", userId);

  await up("user_categories", [
    { user_id: userId, category_id: C["self-development"] },
    { user_id: userId, category_id: C["business-money"] },
  ], "user_id,category_id");

  const favIds = [bookByTitle["Sapiens"].id, bookByTitle["The Midnight Library"].id, bookByTitle["The Psychology of Money"].id];
  await up("favourites", favIds.map((book_id) => ({ user_id: userId, book_id })), "user_id,book_id");

  const unlockIds = [bookByTitle["Atomic Habits"].id];
  await up("book_unlocks", unlockIds.map((book_id) => ({
    user_id: userId, book_id, unlock_method: "coins", coins_spent: bookByTitle["Atomic Habits"].coin_price,
  })), "user_id,book_id");

  await up("listening_progress", [
    { id: id(), user_id: userId, book_id: bookByTitle["Atomic Habits"].id, position_seconds: 1200, is_completed: false, last_listened_at: new Date().toISOString() },
    { id: id(), user_id: userId, book_id: bookByTitle["Daring Greatly"].id, position_seconds: 18900, is_completed: true, last_listened_at: "2026-06-30T10:00:00Z" },
    { id: id(), user_id: userId, book_id: bookByTitle["Sukoon"].id, position_seconds: 2600, is_completed: false, last_listened_at: "2026-06-29T10:00:00Z" },
  ], "user_id,book_id");

  await up("transactions", [
    { id: id(), user_id: userId, type: "purchase", coin_change: 350, amount: 499, currency: "PKR", payment_provider: "stripe", payment_status: "completed" },
    { id: id(), user_id: userId, type: "spend", coin_change: -120, book_id: bookByTitle["Atomic Habits"].id, payment_provider: "none", payment_status: "completed" },
    { id: id(), user_id: userId, type: "promo", coin_change: 50, payment_provider: "none", payment_status: "completed" },
  ]);

  console.log("\n✅ Seed complete.");
  console.log(`\n   Login → email: ${DEMO_EMAIL}   password: ${DEMO_PASSWORD}\n`);
}

main().catch((e) => {
  console.error("\n❌ Seed failed:", e.message);
  process.exit(1);
});
