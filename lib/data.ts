import type {
  Author,
  Book,
  Category,
  Subcategory,
  Chapter,
  HomeCarousel,
  CoinPackage,
  PaymentConfig,
  Transaction,
  AppNotification,
} from "./types";

// ---------------------------------------------------------------------------
// DUMMY DATA — mirrors the ZaraSuno Supabase schema.
// Swap these arrays for Supabase queries once creds are added; the shape stays.
// ---------------------------------------------------------------------------

const cover = (seed: string) =>
  `https://picsum.photos/seed/${seed}/600/600`;

export const AUTHORS: Author[] = [
  { id: "a1", name: "James Clear", bio: "James Clear is a writer and speaker focused on habits, decision-making, and continuous improvement. His work has appeared in the New York Times, Time, and on CBS This Morning.", avatar_url: "https://i.pravatar.cc/200?img=12" },
  { id: "a2", name: "Morgan Housel", bio: "Morgan Housel is a partner at Collaborative Fund and a former columnist at The Motley Fool and The Wall Street Journal. He writes about the psychology of money.", avatar_url: "https://i.pravatar.cc/200?img=15" },
  { id: "a3", name: "Cal Newport", bio: "Cal Newport is a computer science professor at Georgetown University and the author of several bestselling books on focus and the impact of technology on society.", avatar_url: "https://i.pravatar.cc/200?img=33" },
  { id: "a4", name: "Yuval Noah Harari", bio: "Yuval Noah Harari is a historian, philosopher, and the bestselling author of Sapiens, Homo Deus, and 21 Lessons for the 21st Century.", avatar_url: "https://i.pravatar.cc/200?img=52" },
  { id: "a5", name: "Brené Brown", bio: "Brené Brown is a research professor who has spent two decades studying courage, vulnerability, shame, and empathy.", avatar_url: "https://i.pravatar.cc/200?img=45" },
  { id: "a6", name: "Matt Haig", bio: "Matt Haig is the author of the internationally bestselling memoir Reasons to Stay Alive and the novel The Midnight Library.", avatar_url: "https://i.pravatar.cc/200?img=60" },
  { id: "a7", name: "Robert Greene", bio: "Robert Greene is the author of the bestsellers The 48 Laws of Power, Mastery, and The Laws of Human Nature.", avatar_url: "https://i.pravatar.cc/200?img=68" },
  { id: "a8", name: "Ayesha Malik", bio: "Ayesha Malik is a celebrated Urdu novelist known for weaving contemporary stories rooted in South Asian heritage.", avatar_url: "https://i.pravatar.cc/200?img=25" },
];

export const CATEGORIES: Category[] = [
  { id: "c1", name: "Self Development", slug: "self-development", icon: "🌱", sort_order: 1, is_active: true },
  { id: "c2", name: "Business & Money", slug: "business-money", icon: "💼", sort_order: 2, is_active: true },
  { id: "c3", name: "Fiction", slug: "fiction", icon: "📖", sort_order: 3, is_active: true },
  { id: "c4", name: "History & Society", slug: "history-society", icon: "🏛️", sort_order: 4, is_active: true },
  { id: "c5", name: "Health & Mind", slug: "health-mind", icon: "🧠", sort_order: 5, is_active: true },
  { id: "c6", name: "Spirituality", slug: "spirituality", icon: "🕊️", sort_order: 6, is_active: true },
];

export const SUBCATEGORIES: Subcategory[] = [
  { id: "s1", category_id: "c1", name: "Habits & Productivity", slug: "habits", sort_order: 1, is_active: true },
  { id: "s2", category_id: "c1", name: "Focus & Deep Work", slug: "focus", sort_order: 2, is_active: true },
  { id: "s3", category_id: "c1", name: "Confidence", slug: "confidence", sort_order: 3, is_active: true },
  { id: "s4", category_id: "c2", name: "Investing", slug: "investing", sort_order: 1, is_active: true },
  { id: "s5", category_id: "c2", name: "Entrepreneurship", slug: "entrepreneurship", sort_order: 2, is_active: true },
  { id: "s6", category_id: "c3", name: "Literary Fiction", slug: "literary", sort_order: 1, is_active: true },
  { id: "s7", category_id: "c3", name: "Urdu Novels", slug: "urdu-novels", sort_order: 2, is_active: true },
  { id: "s8", category_id: "c4", name: "World History", slug: "world-history", sort_order: 1, is_active: true },
  { id: "s9", category_id: "c5", name: "Mental Wellbeing", slug: "wellbeing", sort_order: 1, is_active: true },
  { id: "s10", category_id: "c6", name: "Mindfulness", slug: "mindfulness", sort_order: 1, is_active: true },
];

export const BOOKS: Book[] = [
  {
    id: "b1", title: "Atomic Habits", subtitle: "Tiny Changes, Remarkable Results",
    description: "No matter your goals, Atomic Habits offers a proven framework for improving every day. James Clear reveals practical strategies that will teach you exactly how to form good habits, break bad ones, and master the tiny behaviors that lead to remarkable results.",
    cover_url: cover("atomichabits"), author_id: "a1", subcategory_id: "s1", language_code: "en",
    coin_price: 120, is_free: false, is_locked: true, duration_seconds: 19080, chapter_count: 8,
    listen_count: 184320, is_book_of_month: true, is_book_of_day: true, is_published: true,
    created_at: "2026-06-20T10:00:00Z", rating: 4.9,
  },
  {
    id: "b2", title: "The Psychology of Money", subtitle: "Timeless Lessons on Wealth & Greed",
    description: "Doing well with money isn't necessarily about what you know. It's about how you behave. Morgan Housel shares 19 short stories exploring the strange ways people think about money.",
    cover_url: cover("psychmoney"), author_id: "a2", subcategory_id: "s4", language_code: "en",
    coin_price: 100, is_free: false, is_locked: true, duration_seconds: 21600, chapter_count: 9,
    listen_count: 152980, is_book_of_month: true, is_book_of_day: false, is_published: true,
    created_at: "2026-06-25T10:00:00Z", rating: 4.8,
  },
  {
    id: "b3", title: "Deep Work", subtitle: "Rules for Focused Success",
    description: "Deep work is the ability to focus without distraction on a cognitively demanding task. Cal Newport shows how to cultivate this skill and thrive in an increasingly distracted world.",
    cover_url: cover("deepwork"), author_id: "a3", subcategory_id: "s2", language_code: "en",
    coin_price: 90, is_free: false, is_locked: true, duration_seconds: 16200, chapter_count: 7,
    listen_count: 98750, is_book_of_month: false, is_book_of_day: false, is_published: true,
    created_at: "2026-06-28T10:00:00Z", rating: 4.7,
  },
  {
    id: "b4", title: "Sapiens", subtitle: "A Brief History of Humankind",
    description: "From the Stone Age to the Silicon Age, Yuval Noah Harari explores how an insignificant ape became the ruler of planet Earth, and where we might be heading next.",
    cover_url: cover("sapiens2"), author_id: "a4", subcategory_id: "s8", language_code: "en",
    coin_price: 150, is_free: false, is_locked: true, duration_seconds: 54000, chapter_count: 20,
    listen_count: 245100, is_book_of_month: true, is_book_of_day: false, is_published: true,
    created_at: "2026-05-30T10:00:00Z", rating: 4.9,
  },
  {
    id: "b5", title: "Daring Greatly", subtitle: "The Courage to Be Vulnerable",
    description: "Brené Brown challenges the belief that vulnerability is weakness. She shows how embracing our imperfections transforms the way we live, love, parent, and lead.",
    cover_url: cover("daring"), author_id: "a5", subcategory_id: "s3", language_code: "en",
    coin_price: 0, is_free: true, is_locked: false, duration_seconds: 18900, chapter_count: 8,
    listen_count: 67400, is_book_of_month: false, is_book_of_day: false, is_published: true,
    created_at: "2026-06-29T10:00:00Z", rating: 4.6,
  },
  {
    id: "b6", title: "The Midnight Library", subtitle: "A Novel of Infinite Lives",
    description: "Between life and death there is a library, and within it, the books are infinite. Nora Seed finds herself faced with the chance to make things right.",
    cover_url: cover("midnight"), author_id: "a6", subcategory_id: "s6", language_code: "en",
    coin_price: 80, is_free: false, is_locked: true, duration_seconds: 32400, chapter_count: 12,
    listen_count: 133200, is_book_of_month: false, is_book_of_day: false, is_published: true,
    created_at: "2026-06-18T10:00:00Z", rating: 4.7,
  },
  {
    id: "b7", title: "The Laws of Human Nature", subtitle: "Master the Art of Reading People",
    description: "Robert Greene draws from the ideas and examples of Pericles, Queen Elizabeth I, Martin Luther King Jr, and more to show us how to detach from our emotions and master self-control.",
    cover_url: cover("humannature"), author_id: "a7", subcategory_id: "s3", language_code: "en",
    coin_price: 140, is_free: false, is_locked: true, duration_seconds: 61200, chapter_count: 18,
    listen_count: 112050, is_book_of_month: false, is_book_of_day: false, is_published: true,
    created_at: "2026-06-10T10:00:00Z", rating: 4.8,
  },
  {
    id: "b8", title: "So Good They Can't Ignore You", subtitle: "Why Skills Beat Passion",
    description: "Cal Newport debunks the conventional wisdom that you should follow your passion, and instead argues that skills, mastery, and craftsmanship are the real path to work you love.",
    cover_url: cover("sogood"), author_id: "a3", subcategory_id: "s5", language_code: "en",
    coin_price: 70, is_free: false, is_locked: true, duration_seconds: 23400, chapter_count: 10,
    listen_count: 54300, is_book_of_month: false, is_book_of_day: false, is_published: true,
    created_at: "2026-06-05T10:00:00Z", rating: 4.5,
  },
  {
    id: "b9", title: "Chand Raat", subtitle: "چاند رات — ایک محبت کی کہانی",
    description: "Ayesha Malik ki likhi hui yeh kahani mohabbat, sabar, aur ummeed ke gird ghoomti hai. Ek aisa safar jo dil ko chhoo jaye.",
    cover_url: cover("chandraat"), author_id: "a8", subcategory_id: "s7", language_code: "ur",
    coin_price: 60, is_free: false, is_locked: true, duration_seconds: 28800, chapter_count: 11,
    listen_count: 78900, is_book_of_month: false, is_book_of_day: false, is_published: true,
    created_at: "2026-06-22T10:00:00Z", rating: 4.6,
  },
  {
    id: "b10", title: "Homo Deus", subtitle: "A Brief History of Tomorrow",
    description: "Yuval Noah Harari examines what might happen to the world when old myths are coupled with new godlike technologies such as artificial intelligence and genetic engineering.",
    cover_url: cover("homodeus"), author_id: "a4", subcategory_id: "s8", language_code: "en",
    coin_price: 150, is_free: false, is_locked: true, duration_seconds: 48600, chapter_count: 16,
    listen_count: 89600, is_book_of_month: false, is_book_of_day: false, is_published: true,
    created_at: "2026-05-20T10:00:00Z", rating: 4.7,
  },
  {
    id: "b11", title: "Reasons to Stay Alive", subtitle: "A Story of Hope",
    description: "Matt Haig's moving, funny and joyous exploration of how to live better, love better and feel more alive after depression nearly ended his life.",
    cover_url: cover("reasons"), author_id: "a6", subcategory_id: "s9", language_code: "en",
    coin_price: 50, is_free: false, is_locked: true, duration_seconds: 14400, chapter_count: 6,
    listen_count: 61200, is_book_of_month: false, is_book_of_day: false, is_published: true,
    created_at: "2026-06-27T10:00:00Z", rating: 4.6,
  },
  {
    id: "b12", title: "Mastery", subtitle: "The Keys to Success and Long-Term Fulfillment",
    description: "Robert Greene examines the lives of history's greatest masters to reveal the secrets of achieving mastery in any field.",
    cover_url: cover("mastery"), author_id: "a7", subcategory_id: "s5", language_code: "en",
    coin_price: 110, is_free: false, is_locked: true, duration_seconds: 43200, chapter_count: 14,
    listen_count: 74800, is_book_of_month: false, is_book_of_day: false, is_published: true,
    created_at: "2026-06-01T10:00:00Z", rating: 4.7,
  },
  {
    id: "b13", title: "The Almanack of Focus", subtitle: "A Practical Guide to Deep Attention",
    description: "A curated set of principles and daily rituals to reclaim your attention in a world engineered for distraction.",
    cover_url: cover("focusalmanack"), author_id: "a3", subcategory_id: "s2", language_code: "en",
    coin_price: 40, is_free: false, is_locked: true, duration_seconds: 10800, chapter_count: 5,
    listen_count: 33100, is_book_of_month: false, is_book_of_day: false, is_published: true,
    created_at: "2026-07-01T10:00:00Z", rating: 4.4,
  },
  {
    id: "b14", title: "Sukoon", subtitle: "سکون — اندرونی سکون کا راستہ",
    description: "Zindagi ki bhaag daud mein apne andar sukoon dhoondne ka safar. Rooh ko taskeen dene wali kahaniyan aur nazmein.",
    cover_url: cover("sukoon"), author_id: "a8", subcategory_id: "s10", language_code: "ur",
    coin_price: 0, is_free: true, is_locked: false, duration_seconds: 12600, chapter_count: 6,
    listen_count: 45600, is_book_of_month: false, is_book_of_day: false, is_published: true,
    created_at: "2026-06-30T10:00:00Z", rating: 4.5,
  },
];

// Chapters — generated for each book.
export const CHAPTERS: Chapter[] = BOOKS.flatMap((book) =>
  Array.from({ length: book.chapter_count }).map((_, i) => ({
    id: `${book.id}-ch${i + 1}`,
    book_id: book.id,
    chapter_number: i + 1,
    title:
      i === 0
        ? "Introduction"
        : i === book.chapter_count - 1
        ? "Final Thoughts"
        : `Chapter ${i + 1}: ${["The Foundation", "Building Momentum", "Deeper Patterns", "The Turning Point", "Putting It Together", "Beyond the Basics", "Real-World Practice", "Lasting Change", "The Long Game", "Mastery", "Reflection", "New Horizons"][i % 12]}`,
    audio_path: `${book.id}/chapter-${i + 1}.mp3`,
    duration_seconds: Math.round(book.duration_seconds / book.chapter_count),
    is_preview: i === 0, // first chapter is a free preview
  }))
);

// Admin-configured home sections.
export const HOME_CAROUSELS: HomeCarousel[] = [
  { id: "hc1", title: "Books of the Month", type: "books_of_month", category_id: null, subcategory_id: null, language_code: null, book_limit: 12, requires_auth: false, sort_order: 1, is_active: true },
  { id: "hc2", title: "Browse by Category", type: "category_selector", category_id: null, subcategory_id: null, language_code: null, book_limit: 50, requires_auth: false, sort_order: 2, is_active: true },
  { id: "hc3", title: "Recommended for You", type: "recommended", category_id: null, subcategory_id: null, language_code: null, book_limit: 12, requires_auth: true, sort_order: 3, is_active: true },
  { id: "hc4", title: "Most Popular", type: "most_popular", category_id: null, subcategory_id: null, language_code: null, book_limit: 12, requires_auth: false, sort_order: 4, is_active: true },
  { id: "hc5", title: "Recently Added", type: "recently_added", category_id: null, subcategory_id: null, language_code: null, book_limit: 12, requires_auth: false, sort_order: 5, is_active: true },
  { id: "hc6", title: "Self Development", type: "category", category_id: "c1", subcategory_id: null, language_code: null, book_limit: 12, requires_auth: false, sort_order: 6, is_active: true },
  { id: "hc7", title: "اردو کتابیں · Urdu Audiobooks", type: "language", category_id: null, subcategory_id: null, language_code: "ur", book_limit: 12, requires_auth: false, sort_order: 7, is_active: true },
];

export const COIN_PACKAGES: CoinPackage[] = [
  { id: "cp1", name: "Starter", coin_amount: 100, bonus_coins: 0, price: 199, currency: "PKR", is_active: true, sort_order: 1 },
  { id: "cp2", name: "Popular", coin_amount: 300, bonus_coins: 50, price: 499, currency: "PKR", is_active: true, sort_order: 2, popular: true },
  { id: "cp3", name: "Value", coin_amount: 600, bonus_coins: 150, price: 899, currency: "PKR", is_active: true, sort_order: 3 },
  { id: "cp4", name: "Pro", coin_amount: 1200, bonus_coins: 400, price: 1599, currency: "PKR", is_active: true, sort_order: 4 },
];

export const PAYMENT_CONFIGS: PaymentConfig[] = [
  { id: "pc1", country: "PK", provider: "stripe", display_name: "Credit / Debit Card", description: "Pay securely with Visa, Mastercard or American Express via Stripe.", account_details: null, qr_code_url: null, is_active: true },
  { id: "pc2", country: "PK", provider: "jazzcash", display_name: "JazzCash", description: "Scan the QR with your JazzCash app, send the amount, then submit your transaction ID and a screenshot below. Coins are credited after admin approval.", account_details: "0300-1234567 (ZaraSuno Pvt Ltd)", qr_code_url: cover("jazzcashqr"), is_active: true },
  { id: "pc3", country: "PK", provider: "easypaisa", display_name: "EasyPaisa", description: "Scan the QR with your EasyPaisa app, send the amount, then submit your transaction ID and a screenshot below. Coins are credited after admin approval.", account_details: "0345-7654321 (ZaraSuno Pvt Ltd)", qr_code_url: cover("easypaisaqr"), is_active: true },
];

export const TRANSACTIONS: Transaction[] = [
  { id: "t1", type: "purchase", coin_change: 350, amount: 499, currency: "PKR", payment_provider: "stripe", payment_status: "completed", created_at: "2026-06-28T14:20:00Z", label: "Popular Pack purchase" },
  { id: "t2", type: "spend", coin_change: -120, amount: null, currency: "PKR", payment_provider: "none", payment_status: "completed", created_at: "2026-06-28T15:02:00Z", label: "Unlocked · Atomic Habits" },
  { id: "t3", type: "promo", coin_change: 50, amount: null, currency: "PKR", payment_provider: "none", payment_status: "completed", created_at: "2026-06-25T09:10:00Z", label: "Promocode WELCOME50" },
  { id: "t4", type: "spend", coin_change: -100, amount: null, currency: "PKR", payment_provider: "none", payment_status: "completed", created_at: "2026-06-20T18:45:00Z", label: "Unlocked · The Psychology of Money" },
  { id: "t5", type: "purchase", coin_change: 100, amount: 199, currency: "PKR", payment_provider: "jazzcash", payment_status: "pending", created_at: "2026-07-01T11:30:00Z", label: "Starter Pack — awaiting approval" },
];

export const NOTIFICATIONS: AppNotification[] = [
  { id: "n1", title: "New this month 🎉", body: "Atomic Habits and 3 more titles just landed in Books of the Month.", is_read: false, created_at: "2026-07-01T08:00:00Z" },
  { id: "n2", title: "Your pack is being verified", body: "We received your JazzCash payment. Coins will be added shortly.", is_read: false, created_at: "2026-07-01T11:31:00Z" },
  { id: "n3", title: "Welcome to ZaraSuno", body: "Enjoy 50 free coins on us — start listening today!", is_read: true, created_at: "2026-06-25T09:10:00Z" },
];

// ---------------------------------------------------------------------------
// Query helpers (mirror /lib/queries/*.ts). Pure functions over dummy data.
// ---------------------------------------------------------------------------

export const getAuthor = (id: string) => AUTHORS.find((a) => a.id === id);
export const getBook = (id: string) => BOOKS.find((b) => b.id === id);
export const getChaptersForBook = (bookId: string) =>
  CHAPTERS.filter((c) => c.book_id === bookId).sort((a, b) => a.chapter_number - b.chapter_number);

export function getSubcategory(id: string) {
  return SUBCATEGORIES.find((s) => s.id === id);
}
export function getCategoryForBook(book: Book) {
  const sub = getSubcategory(book.subcategory_id);
  return sub ? CATEGORIES.find((c) => c.id === sub.category_id) : undefined;
}
export function getSubcategoriesForCategory(categoryId: string) {
  return SUBCATEGORIES.filter((s) => s.category_id === categoryId);
}
export function getBooksForSubcategory(subId: string) {
  return BOOKS.filter((b) => b.subcategory_id === subId);
}

export function booksForCarousel(c: HomeCarousel): Book[] {
  switch (c.type) {
    case "books_of_month":
      return BOOKS.filter((b) => b.is_book_of_month);
    case "recently_added":
      return [...BOOKS].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
    case "most_popular":
      return [...BOOKS].sort((a, b) => b.listen_count - a.listen_count);
    case "recommended":
      return [...BOOKS].sort(() => Math.random() - 0.5).slice(0, c.book_limit);
    case "category": {
      const subIds = SUBCATEGORIES.filter((s) => s.category_id === c.category_id).map((s) => s.id);
      return BOOKS.filter((b) => subIds.includes(b.subcategory_id));
    }
    case "language":
      return BOOKS.filter((b) => b.language_code === c.language_code);
    default:
      return BOOKS;
  }
}

// Simulated per-user state (would come from book_unlocks / favourites / profile).
export const DEMO_UNLOCKED_BOOK_IDS = new Set<string>(["b1", "b5", "b14"]);
export const DEMO_FAVOURITE_BOOK_IDS = new Set<string>(["b4", "b6", "b2"]);
export const DEMO_COIN_BALANCE = 230;

export function isUnlocked(book: Book) {
  return book.is_free || DEMO_UNLOCKED_BOOK_IDS.has(book.id);
}
