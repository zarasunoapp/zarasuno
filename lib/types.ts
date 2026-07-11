// Types mirror the Supabase schema so we can swap dummy data for real queries later.

export interface Author {
  id: string;
  name: string;
  bio: string | null;
  avatar_url: string | null;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string; // emoji stand-in for icon_url in dummy data
  sort_order: number;
  is_active: boolean;
}

export interface Subcategory {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  sort_order: number;
  is_active: boolean;
}

export interface Chapter {
  id: string;
  book_id: string;
  chapter_number: number;
  title: string;
  audio_path: string;
  duration_seconds: number;
  is_preview: boolean;
}

export interface Book {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  cover_url: string;
  author_id: string;
  subcategory_id: string;
  language_code: string;
  coin_price: number;
  is_free: boolean;
  is_locked: boolean;
  duration_seconds: number;
  book_type?: string; // 'summary' | 'audiobook' | 'ebook'
  ebook_file?: string | null; // storage path in private `ebooks` bucket (from metadata)
  chapter_count: number;
  listen_count: number;
  is_book_of_month: boolean;
  is_book_of_day: boolean;
  is_published: boolean;
  created_at: string;
  rating: number; // display-only helper
  is_recommended?: boolean;
  is_top_selling?: boolean;
  author_name?: string; // populated via join
  category_name?: string; // populated via join
}

export type CarouselType =
  | "books_of_month"
  | "recently_added"
  | "most_popular"
  | "recommended"
  | "category"
  | "language"
  | "collection"
  | "manual"
  | "category_selector";

export interface HomeCarousel {
  id: string;
  title: string;
  type: CarouselType;
  category_id: string | null;
  subcategory_id: string | null;
  language_code: string | null;
  book_limit: number;
  requires_auth: boolean;
  sort_order: number;
  is_active: boolean;
}

export interface CoinPackage {
  id: string;
  name: string;
  coin_amount: number;
  bonus_coins: number;
  price: number;
  currency: string;
  is_active: boolean;
  sort_order: number;
  popular?: boolean;
}

export interface PaymentConfig {
  id: string;
  country: string;
  provider: "stripe" | "jazzcash" | "easypaisa" | "bank";
  display_name: string;
  description: string;
  account_details: string | null;
  qr_code_url: string | null;
  is_active: boolean;
}

export interface Transaction {
  id: string;
  type: "purchase" | "spend" | "admin_grant" | "promo" | "refund";
  coin_change: number;
  amount: number | null;
  currency: string;
  payment_provider: string;
  payment_status: "pending" | "completed" | "failed" | "refunded";
  created_at: string;
  label: string;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
}
