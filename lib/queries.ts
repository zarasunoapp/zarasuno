import { createClient } from "@/lib/supabase/server";
import { convertedPrice } from "@/lib/pricing";
import type {
  Author, Book, Category, Subcategory, Chapter, CoinPackage, PaymentConfig,
} from "@/lib/types";

// Server-side data access for ZaraSuno. Reads run with the anon key under RLS.

// Deterministic display rating (schema has no rating column).
function ratingFor(listen: number, id: string) {
  const h = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return Math.min(5, 4.4 + ((h + listen) % 6) / 10);
}

function mapBook(row: any): Book {
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle,
    description: row.description,
    cover_url: row.cover_url || `https://picsum.photos/seed/${row.id}/600/600`,
    author_id: row.author_id,
    subcategory_id: row.subcategory_id,
    language_code: row.language_code,
    coin_price: row.coin_price,
    is_free: row.is_free,
    is_locked: row.is_locked,
    duration_seconds: row.duration_seconds ?? 0,
    book_type: row.book_type ?? "audiobook",
    ebook_file: row.metadata?.ebook_file ?? null,
    chapter_count: row.chapter_count ?? 0,
    listen_count: row.listen_count ?? 0,
    is_book_of_month: row.is_book_of_month ?? false,
    is_book_of_day: row.is_book_of_day ?? false,
    is_recommended: row.is_recommended ?? false,
    is_top_selling: row.is_top_selling ?? false,
    is_published: row.is_published,
    created_at: row.created_at,
    rating: ratingFor(row.listen_count ?? 0, row.id),
    author_name: row.authors?.name,
    category_name: row.subcategories?.categories?.name,
  };
}

// books now has multiple author FKs (author_id, author_2_id…), so the authors
// embed must be disambiguated to the primary author FK or PostgREST errors.
const BOOK_SELECT =
  "*, authors!books_author_id_fkey(name), subcategories(name, category_id, categories(name))";

export async function getAllBooks(): Promise<Book[]> {
  const db = createClient();
  const { data } = await db.from("books").select(BOOK_SELECT).eq("is_published", true);
  return (data ?? []).map(mapBook);
}

export async function getCategories(): Promise<Category[]> {
  const db = createClient();
  const { data } = await db.from("categories").select("*").eq("is_active", true).order("sort_order");
  return (data ?? []).map((c: any) => ({
    id: c.id, name: c.name, slug: c.slug, icon: c.icon_url || "📚",
    sort_order: c.sort_order, is_active: c.is_active,
  }));
}

export async function getSubcategories(): Promise<Subcategory[]> {
  const db = createClient();
  const { data } = await db.from("subcategories").select("*").eq("is_active", true).order("sort_order");
  return (data ?? []).map((s: any) => ({
    id: s.id, category_id: s.category_id, name: s.name, slug: s.slug,
    sort_order: s.sort_order, is_active: s.is_active,
  }));
}

export interface FeaturedBook {
  id: string;
  book_id: string | null;
  title: string | null;
  image_url: string;
  sort_order: number;
}

// Admin-managed Featured Books band — images only, ordered by sort_order.
export async function getFeaturedBooks(): Promise<FeaturedBook[]> {
  const db = createClient();
  const { data } = await db
    .from("featured_books")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  return (data ?? [])
    .filter((r: any) => r.image_url)
    .map((r: any) => ({
      id: r.id,
      book_id: r.book_id ?? null,
      title: r.title ?? null,
      image_url: r.image_url,
      sort_order: r.sort_order ?? 0,
    }));
}

export interface HomeSection {
  id: string;
  title: string;
  type: string;
  books: Book[];
}

export async function getHomeSections(signedIn: boolean): Promise<HomeSection[]> {
  const db = createClient();
  const [{ data: carousels }, books] = await Promise.all([
    db.from("home_carousels").select("*").eq("is_active", true).order("sort_order"),
    getAllBooks(),
  ]);

  const byId = new Map(books.map((b) => [b.id, b]));
  const subs = await getSubcategories();

  const sections: HomeSection[] = [];
  for (const c of carousels ?? []) {
    if (c.requires_auth && !signedIn) continue;
    let list: Book[] = [];
    switch (c.type) {
      case "books_of_month":
        list = books.filter((b) => b.is_book_of_month || b.is_book_of_day);
        break;
      case "recently_added":
        list = [...books].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
        break;
      case "most_popular":
        list = [...books].sort((a, b) => b.listen_count - a.listen_count);
        break;
      case "recommended":
        list = books.filter((b) => b.is_recommended);
        break;
      case "top_selling":
        list = books.filter((b) => b.is_top_selling);
        break;
      case "category": {
        const subIds = subs.filter((s) => s.category_id === c.category_id).map((s) => s.id);
        list = books.filter((b) => subIds.includes(b.subcategory_id));
        break;
      }
      case "language":
        list = books.filter((b) => b.language_code === c.language_code);
        break;
      case "collection": {
        if (c.collection_id) {
          const { data: cb } = await db
            .from("collection_books")
            .select("book_id, sort_order")
            .eq("collection_id", c.collection_id)
            .order("sort_order");
          list = (cb ?? []).map((r: any) => byId.get(r.book_id)).filter(Boolean) as Book[];
        }
        break;
      }
      case "manual": {
        const { data: cb } = await db
          .from("carousel_books")
          .select("book_id, sort_order")
          .eq("carousel_id", c.id)
          .order("sort_order");
        list = (cb ?? []).map((r: any) => byId.get(r.book_id)).filter(Boolean) as Book[];
        break;
      }
      default:
        list = books;
    }
    if (list.length) sections.push({ id: c.id, title: c.title, type: c.type, books: list.slice(0, c.book_limit ?? 12) });
  }
  return sections;
}

export async function getBookById(id: string): Promise<Book | null> {
  const db = createClient();
  const { data } = await db.from("books").select(BOOK_SELECT).eq("id", id).maybeSingle();
  return data ? mapBook(data) : null;
}

export async function getAuthorById(id: string | null): Promise<Author | null> {
  if (!id) return null;
  const db = createClient();
  const { data } = await db.from("authors").select("*").eq("id", id).maybeSingle();
  return data ? { id: data.id, name: data.name, bio: data.bio, avatar_url: data.avatar_url } : null;
}

export async function getChaptersForBook(bookId: string): Promise<Chapter[]> {
  const db = createClient();
  const { data } = await db.from("chapters").select("*").eq("book_id", bookId).order("chapter_number");
  return (data ?? []).map((c: any) => ({
    id: c.id, book_id: c.book_id, chapter_number: c.chapter_number, title: c.title,
    audio_path: c.audio_path, duration_seconds: c.duration_seconds ?? 0, is_preview: c.is_preview ?? false,
  }));
}

export async function getCoinPackages(country?: string): Promise<CoinPackage[]> {
  const db = createClient();
  const { data } = await db.from("coin_packages").select("*").eq("is_active", true).order("sort_order");

  // per-country price overrides (falls back to the package's default price)
  const overrides: Record<string, { price: number; currency: string }> = {};
  if (country) {
    const { data: prices } = await db
      .from("coin_package_prices")
      .select("package_id, price, currency")
      .eq("country_code", country)
      .eq("is_active", true);
    for (const r of prices ?? []) overrides[r.package_id] = { price: Number(r.price), currency: r.currency };
  }

  return Promise.all((data ?? []).map(async (p: any, i: number) => {
    let price = Number(p.price);
    let currency = p.currency;
    if (overrides[p.id]) {
      price = overrides[p.id].price;
      currency = overrides[p.id].currency;
    } else if (country) {
      // no manual override → auto-convert at today's FX rate
      const c = await convertedPrice(Number(p.price), p.currency, country);
      price = c.price;
      currency = c.currency;
    }
    return {
      id: p.id, name: p.name, coin_amount: p.coin_amount, bonus_coins: p.bonus_coins ?? 0,
      price, currency, is_active: p.is_active, sort_order: p.sort_order, popular: i === 1,
    };
  }));
}

// Manual per-country override for a package (coin_package_prices), if any.
export async function countryPrice(
  db: ReturnType<typeof createClient>,
  packageId: string,
  country: string | null | undefined
): Promise<{ price: number; currency: string } | null> {
  if (!country) return null;
  const { data } = await db
    .from("coin_package_prices")
    .select("price, currency")
    .eq("package_id", packageId)
    .eq("country_code", country)
    .eq("is_active", true)
    .maybeSingle();
  return data ? { price: Number(data.price), currency: data.currency } : null;
}

// Server-side authoritative price for a package in a country: manual override
// first, else auto FX conversion, else the package's base price.
export async function priceForPackage(
  db: ReturnType<typeof createClient>,
  pkg: { id: string; price: number | string; currency: string },
  country: string | null | undefined
): Promise<{ price: number; currency: string }> {
  if (country) {
    const manual = await countryPrice(db, pkg.id, country);
    if (manual) return manual;
    return await convertedPrice(Number(pkg.price), pkg.currency, country);
  }
  return { price: Number(pkg.price), currency: pkg.currency };
}

export async function getPaymentConfigs(country: string): Promise<PaymentConfig[]> {
  const db = createClient();
  // Always keep the home (PK) local methods (JazzCash/EasyPaisa) available, plus
  // any methods for the visitor's own country — so IP geolocation never hides them.
  const countries = Array.from(new Set([country, "PK"]));
  const { data } = await db.from("payment_configs").select("*").eq("is_active", true).in("country", countries).order("sort_order");
  return (data ?? []).map((p: any) => ({
    id: p.id, country: p.country, provider: p.provider, display_name: p.display_name,
    description: p.description ?? "", account_details: p.account_details, qr_code_url: p.qr_code_url,
    is_active: p.is_active,
  }));
}

export async function getContentPage(slug: string) {
  const db = createClient();
  const { data } = await db.from("content_pages").select("*").eq("slug", slug).maybeSingle();
  return data
    ? { title: data.title as string, body: (data.body as string) ?? "", updated_at: data.updated_at as string | null }
    : null;
}

export interface Faq { id: string; question: string; answer: string }

export async function getFaqs(): Promise<Faq[]> {
  const db = createClient();
  const { data } = await db.from("faqs").select("*").eq("is_active", true).order("sort_order");
  return (data ?? []).map((f: any) => ({ id: f.id, question: f.question, answer: f.answer }));
}

export interface Testimonial {
  id: string;
  name: string;
  title: string | null;
  message: string;
  rating: number;
  avatar_url: string | null;
}

export async function getTestimonials(): Promise<Testimonial[]> {
  const db = createClient();
  const { data } = await db.from("testimonials").select("*").eq("is_active", true).order("sort_order", { ascending: true });
  return (data ?? []).map((t: any) => ({
    id: t.id, name: t.name, title: t.title ?? null, message: t.message,
    rating: t.rating ?? 5, avatar_url: t.avatar_url ?? null,
  }));
}

// Read an admin-controlled app_settings jsonb value by key (e.g. 'home_hero', 'brand').
export async function getAppSetting<T = any>(key: string): Promise<T | null> {
  const db = createClient();
  const { data } = await db.from("app_settings").select("value").eq("key", key).maybeSingle();
  return (data?.value as T) ?? null;
}

export async function getSessionUser() {
  const db = createClient();
  const { data } = await db.auth.getUser();
  return data.user;
}
