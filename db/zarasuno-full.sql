-- ============================================================================
-- ZARASUNO.app — FULL SCHEMA + SEED (single file)
-- Paste this whole file into: Supabase Dashboard > SQL Editor > New query > Run
-- It creates every table, function, trigger, RLS policy, storage bucket,
-- all demo content, and a ready-to-use login user.
--
--   Demo login →  email: demo@zarasuno.app   password: ZaraSuno123!
-- ============================================================================

-- ------------------------------------------------------------
-- 0. EXTENSIONS
-- ------------------------------------------------------------
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- 1. TABLES
-- ------------------------------------------------------------
create table if not exists public.languages (
  code text primary key, name text not null, is_active boolean not null default true
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text, email text, phone text, avatar_url text,
  country text not null default 'PK',
  preferred_language text references public.languages(code) default 'en',
  coin_balance integer not null default 0,
  role text not null default 'user' check (role in ('user','admin')),
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null, slug text unique not null, icon_url text,
  sort_order integer default 0, is_active boolean default true, created_at timestamptz default now()
);

create table if not exists public.subcategories (
  id uuid primary key default uuid_generate_v4(),
  category_id uuid not null references public.categories(id) on delete cascade,
  name text not null, slug text not null, sort_order integer default 0,
  is_active boolean default true, created_at timestamptz default now(),
  unique (category_id, slug)
);

create table if not exists public.authors (
  id uuid primary key default uuid_generate_v4(),
  name text not null, bio text, avatar_url text, created_at timestamptz default now()
);

create table if not exists public.books (
  id uuid primary key default uuid_generate_v4(),
  title text not null, subtitle text, description text, cover_url text,
  author_id uuid references public.authors(id) on delete set null,
  subcategory_id uuid references public.subcategories(id) on delete set null,
  language_code text references public.languages(code) default 'en',
  coin_price integer not null default 0,
  is_free boolean not null default false,
  is_locked boolean not null default true,
  duration_seconds integer default 0, chapter_count integer default 0,
  listen_count integer not null default 0,
  is_book_of_month boolean default false, is_book_of_day boolean default false,
  is_published boolean not null default true,
  created_at timestamptz default now(), updated_at timestamptz default now()
);
create index if not exists idx_books_subcategory on public.books(subcategory_id);
create index if not exists idx_books_language on public.books(language_code);
create index if not exists idx_books_created on public.books(created_at desc);
create index if not exists idx_books_listen on public.books(listen_count desc);

create table if not exists public.chapters (
  id uuid primary key default uuid_generate_v4(),
  book_id uuid not null references public.books(id) on delete cascade,
  chapter_number integer not null, title text not null, audio_path text not null,
  duration_seconds integer default 0, is_preview boolean default false,
  created_at timestamptz default now(), unique (book_id, chapter_number)
);
create index if not exists idx_chapters_book on public.chapters(book_id);

create table if not exists public.user_categories (
  user_id uuid references public.profiles(id) on delete cascade,
  category_id uuid references public.categories(id) on delete cascade,
  primary key (user_id, category_id)
);

create table if not exists public.book_unlocks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  book_id uuid not null references public.books(id) on delete cascade,
  unlock_method text not null check (unlock_method in ('coins','admin','promo','free')),
  coins_spent integer default 0, created_at timestamptz default now(),
  unique (user_id, book_id)
);

create table if not exists public.favourites (
  user_id uuid references public.profiles(id) on delete cascade,
  book_id uuid references public.books(id) on delete cascade,
  created_at timestamptz default now(), primary key (user_id, book_id)
);

create table if not exists public.listening_progress (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  book_id uuid not null references public.books(id) on delete cascade,
  chapter_id uuid references public.chapters(id) on delete set null,
  position_seconds integer default 0, is_completed boolean default false,
  last_listened_at timestamptz default now(), unique (user_id, book_id)
);

create table if not exists public.coin_packages (
  id uuid primary key default uuid_generate_v4(),
  name text not null, coin_amount integer not null, bonus_coins integer default 0,
  price numeric(10,2) not null, currency text not null default 'PKR',
  is_active boolean default true, sort_order integer default 0, created_at timestamptz default now()
);

create table if not exists public.transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('purchase','spend','admin_grant','promo','refund')),
  coin_change integer not null, amount numeric(10,2), currency text default 'PKR',
  package_id uuid references public.coin_packages(id),
  book_id uuid references public.books(id),
  payment_provider text check (payment_provider in ('stripe','jazzcash','easypaisa','manual','none')),
  payment_status text not null default 'completed' check (payment_status in ('pending','completed','failed','refunded')),
  payment_reference text, payment_proof_url text, created_at timestamptz default now()
);
create index if not exists idx_txn_user on public.transactions(user_id);
create index if not exists idx_txn_status on public.transactions(payment_status);

create table if not exists public.payment_configs (
  id uuid primary key default uuid_generate_v4(),
  country text not null default 'PK',
  provider text not null check (provider in ('stripe','jazzcash','easypaisa','bank')),
  display_name text not null, description text, account_details text, qr_code_url text,
  is_active boolean default true, sort_order integer default 0
);

create table if not exists public.home_carousels (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  type text not null check (type in ('books_of_month','recently_added','most_popular','recommended','category','language','collection','manual')),
  category_id uuid references public.categories(id),
  subcategory_id uuid references public.subcategories(id),
  language_code text references public.languages(code),
  book_limit integer default 50, requires_auth boolean default false,
  sort_order integer default 0, is_active boolean default true, created_at timestamptz default now()
);

create table if not exists public.carousel_books (
  carousel_id uuid references public.home_carousels(id) on delete cascade,
  book_id uuid references public.books(id) on delete cascade,
  sort_order integer default 0, primary key (carousel_id, book_id)
);

create table if not exists public.promocodes (
  id uuid primary key default uuid_generate_v4(),
  code text unique not null, coin_reward integer not null default 0,
  max_uses integer, used_count integer default 0, per_user_limit integer default 1,
  expires_at timestamptz, is_active boolean default true, created_at timestamptz default now()
);

create table if not exists public.promocode_redemptions (
  id uuid primary key default uuid_generate_v4(),
  promocode_id uuid references public.promocodes(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz default now(), unique (promocode_id, user_id)
);

create table if not exists public.content_pages (
  slug text primary key, title text not null, body text, updated_at timestamptz default now()
);

create table if not exists public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade,
  title text not null, body text, is_read boolean default false, created_at timestamptz default now()
);

create table if not exists public.feedback (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete set null,
  message text not null, rating integer check (rating between 1 and 5),
  status text default 'new' check (status in ('new','reviewed','resolved')),
  created_at timestamptz default now()
);

create table if not exists public.app_settings (
  key text primary key, value jsonb, updated_at timestamptz default now()
);

-- ------------------------------------------------------------
-- 2. FUNCTIONS & TRIGGERS
-- ------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean language sql security definer stable as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function public.unlock_book_with_coins(p_book_id uuid)
returns json language plpgsql security definer as $$
declare v_user_id uuid := auth.uid(); v_price integer; v_balance integer;
begin
  if v_user_id is null then return json_build_object('success', false, 'error', 'not_authenticated'); end if;
  select coin_price into v_price from public.books where id = p_book_id and is_published = true;
  if v_price is null then return json_build_object('success', false, 'error', 'book_not_found'); end if;
  if exists (select 1 from public.book_unlocks where user_id = v_user_id and book_id = p_book_id) then
    return json_build_object('success', true, 'already_unlocked', true);
  end if;
  select coin_balance into v_balance from public.profiles where id = v_user_id for update;
  if v_balance < v_price then
    return json_build_object('success', false, 'error', 'insufficient_coins', 'balance', v_balance, 'price', v_price);
  end if;
  update public.profiles set coin_balance = coin_balance - v_price where id = v_user_id;
  insert into public.book_unlocks (user_id, book_id, unlock_method, coins_spent)
  values (v_user_id, p_book_id, 'coins', v_price);
  insert into public.transactions (user_id, type, coin_change, book_id, payment_provider, payment_status)
  values (v_user_id, 'spend', -v_price, p_book_id, 'none', 'completed');
  return json_build_object('success', true, 'unlocked', true, 'new_balance', v_balance - v_price);
end; $$;

create or replace function public.increment_listen_count(p_book_id uuid)
returns void language sql security definer as $$
  update public.books set listen_count = listen_count + 1 where id = p_book_id;
$$;

-- ------------------------------------------------------------
-- 3. ROW LEVEL SECURITY
-- ------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.subcategories enable row level security;
alter table public.authors enable row level security;
alter table public.languages enable row level security;
alter table public.books enable row level security;
alter table public.chapters enable row level security;
alter table public.user_categories enable row level security;
alter table public.book_unlocks enable row level security;
alter table public.favourites enable row level security;
alter table public.listening_progress enable row level security;
alter table public.coin_packages enable row level security;
alter table public.transactions enable row level security;
alter table public.payment_configs enable row level security;
alter table public.home_carousels enable row level security;
alter table public.carousel_books enable row level security;
alter table public.promocodes enable row level security;
alter table public.promocode_redemptions enable row level security;
alter table public.content_pages enable row level security;
alter table public.notifications enable row level security;
alter table public.feedback enable row level security;
alter table public.app_settings enable row level security;

do $$ begin
  -- public reads
  create policy "public read" on public.languages for select using (true);
  create policy "public read" on public.categories for select using (is_active);
  create policy "public read" on public.subcategories for select using (is_active);
  create policy "public read" on public.authors for select using (true);
  create policy "public read" on public.books for select using (is_published);
  create policy "public read" on public.chapters for select using (true);
  create policy "public read" on public.coin_packages for select using (is_active);
  create policy "public read" on public.payment_configs for select using (is_active);
  create policy "public read" on public.home_carousels for select using (is_active);
  create policy "public read" on public.carousel_books for select using (true);
  create policy "public read" on public.content_pages for select using (true);
  -- own-row
  create policy "own profile select" on public.profiles for select using (auth.uid() = id or public.is_admin());
  create policy "own profile update" on public.profiles for update using (auth.uid() = id);
  create policy "own cats" on public.user_categories for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
  create policy "own unlocks" on public.book_unlocks for select using (auth.uid() = user_id or public.is_admin());
  create policy "own favs" on public.favourites for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
  create policy "own progress" on public.listening_progress for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
  create policy "own txns" on public.transactions for select using (auth.uid() = user_id or public.is_admin());
  create policy "insert own txn" on public.transactions for insert with check (auth.uid() = user_id);
  create policy "own notifs" on public.notifications for select using (user_id is null or auth.uid() = user_id);
  create policy "update own notifs" on public.notifications for update using (auth.uid() = user_id);
  create policy "own redemptions" on public.promocode_redemptions for select using (auth.uid() = user_id or public.is_admin());
  create policy "insert feedback" on public.feedback for insert with check (auth.uid() = user_id);
  create policy "read own feedback" on public.feedback for select using (auth.uid() = user_id or public.is_admin());
  create policy "read promocodes" on public.promocodes for select using (is_active);
  -- admin full access
  create policy "admin all profiles" on public.profiles for all using (public.is_admin());
  create policy "admin all categories" on public.categories for all using (public.is_admin());
  create policy "admin all subcats" on public.subcategories for all using (public.is_admin());
  create policy "admin all authors" on public.authors for all using (public.is_admin());
  create policy "admin all languages" on public.languages for all using (public.is_admin());
  create policy "admin all books" on public.books for all using (public.is_admin());
  create policy "admin all chapters" on public.chapters for all using (public.is_admin());
  create policy "admin all packages" on public.coin_packages for all using (public.is_admin());
  create policy "admin all pay" on public.payment_configs for all using (public.is_admin());
  create policy "admin all carousels" on public.home_carousels for all using (public.is_admin());
  create policy "admin all carousel_bk" on public.carousel_books for all using (public.is_admin());
  create policy "admin all promocodes" on public.promocodes for all using (public.is_admin());
  create policy "admin all pages" on public.content_pages for all using (public.is_admin());
  create policy "admin all notifs" on public.notifications for all using (public.is_admin());
  create policy "admin all feedback" on public.feedback for all using (public.is_admin());
  create policy "admin all settings" on public.app_settings for all using (public.is_admin());
  create policy "admin all unlocks" on public.book_unlocks for all using (public.is_admin());
  create policy "admin all txns" on public.transactions for all using (public.is_admin());
exception when duplicate_object then null; end $$;

-- ------------------------------------------------------------
-- 4. STORAGE BUCKETS
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public) values
  ('book-covers','book-covers',true), ('book-audio','book-audio',false),
  ('authors','authors',true), ('avatars','avatars',true),
  ('payment-qr','payment-qr',true), ('category-icons','category-icons',true)
  on conflict do nothing;

-- ============================================================================
-- 5. SEED CONTENT
-- ============================================================================
insert into public.languages (code, name) values ('en','English'),('ur','Urdu'),('hi','Hindi')
  on conflict do nothing;

insert into public.app_settings (key, value) values
  ('brand', '{"name":"ZaraSuno","primary":"#0B5D4B","accent":"#D9A94C"}'::jsonb)
  on conflict do nothing;

insert into public.categories (name, slug, icon_url, sort_order) values
  ('Self Development','self-development','🌱',1),
  ('Business & Money','business-money','💼',2),
  ('Fiction','fiction','📖',3),
  ('History & Society','history-society','🏛️',4),
  ('Health & Mind','health-mind','🧠',5),
  ('Spirituality','spirituality','🕊️',6)
  on conflict (slug) do nothing;

insert into public.subcategories (category_id, name, slug, sort_order)
select c.id, v.name, v.slug, v.so from (values
  ('self-development','Habits & Productivity','habits',1),
  ('self-development','Focus & Deep Work','focus',2),
  ('self-development','Confidence','confidence',3),
  ('business-money','Investing','investing',1),
  ('business-money','Entrepreneurship','entrepreneurship',2),
  ('fiction','Literary Fiction','literary',1),
  ('fiction','Urdu Novels','urdu-novels',2),
  ('history-society','World History','world-history',1),
  ('health-mind','Mental Wellbeing','wellbeing',1),
  ('spirituality','Mindfulness','mindfulness',1)
) as v(cat_slug,name,slug,so)
join public.categories c on c.slug = v.cat_slug
on conflict (category_id, slug) do nothing;

insert into public.authors (name, bio, avatar_url) values
  ('James Clear','James Clear is a writer and speaker focused on habits, decision-making, and continuous improvement.','https://i.pravatar.cc/200?img=12'),
  ('Morgan Housel','Morgan Housel is a partner at Collaborative Fund who writes about the psychology of money.','https://i.pravatar.cc/200?img=15'),
  ('Cal Newport','Cal Newport is a computer science professor at Georgetown and author on focus and technology.','https://i.pravatar.cc/200?img=33'),
  ('Yuval Noah Harari','Yuval Noah Harari is a historian and bestselling author of Sapiens and Homo Deus.','https://i.pravatar.cc/200?img=52'),
  ('Brené Brown','Brené Brown is a research professor studying courage, vulnerability, shame, and empathy.','https://i.pravatar.cc/200?img=45'),
  ('Matt Haig','Matt Haig is the author of Reasons to Stay Alive and The Midnight Library.','https://i.pravatar.cc/200?img=60'),
  ('Robert Greene','Robert Greene is the author of The 48 Laws of Power, Mastery, and The Laws of Human Nature.','https://i.pravatar.cc/200?img=68'),
  ('Ayesha Malik','Ayesha Malik is a celebrated Urdu novelist rooted in South Asian heritage.','https://i.pravatar.cc/200?img=25')
  on conflict do nothing;

insert into public.books (title, subtitle, description, cover_url, author_id, subcategory_id, language_code, coin_price, is_free, is_locked, duration_seconds, chapter_count, listen_count, is_book_of_month, is_book_of_day, created_at)
select v.title, v.subtitle, v.description,
  'https://picsum.photos/seed/'||v.seed||'/600/600',
  a.id, s.id, v.lang, v.price, v.is_free, not v.is_free, v.dur, v.chapters, v.listens, v.bom, v.bod, v.created::timestamptz
from (values
  ('Atomic Habits','Tiny Changes, Remarkable Results','No matter your goals, Atomic Habits offers a proven framework for improving every day.','atomichabits','James Clear','habits','en',120,false,19080,8,184320,true,true,'2026-06-20'),
  ('The Psychology of Money','Timeless Lessons on Wealth & Greed','Doing well with money is about how you behave. Morgan Housel shares 19 short stories.','psychmoney','Morgan Housel','investing','en',100,false,21600,9,152980,true,false,'2026-06-25'),
  ('Deep Work','Rules for Focused Success','Cal Newport shows how to cultivate focus and thrive in a distracted world.','deepwork','Cal Newport','focus','en',90,false,16200,7,98750,false,false,'2026-06-28'),
  ('Sapiens','A Brief History of Humankind','How an insignificant ape became the ruler of planet Earth.','sapiens2','Yuval Noah Harari','world-history','en',150,false,54000,20,245100,true,false,'2026-05-30'),
  ('Daring Greatly','The Courage to Be Vulnerable','Brené Brown shows how embracing imperfection transforms how we live and lead.','daring','Brené Brown','confidence','en',0,true,18900,8,67400,false,false,'2026-06-29'),
  ('The Midnight Library','A Novel of Infinite Lives','Between life and death there is a library, and within it the books are infinite.','midnight','Matt Haig','literary','en',80,false,32400,12,133200,false,false,'2026-06-18'),
  ('The Laws of Human Nature','Master the Art of Reading People','Robert Greene shows how to detach from our emotions and master self-control.','humannature','Robert Greene','confidence','en',140,false,61200,18,112050,false,false,'2026-06-10'),
  ('So Good They Can''t Ignore You','Why Skills Beat Passion','Skills, mastery and craftsmanship are the real path to work you love.','sogood','Cal Newport','entrepreneurship','en',70,false,23400,10,54300,false,false,'2026-06-05'),
  ('Chand Raat','چاند رات — ایک محبت کی کہانی','Ayesha Malik ki likhi hui yeh kahani mohabbat, sabar, aur ummeed ke gird ghoomti hai.','chandraat','Ayesha Malik','urdu-novels','ur',60,false,28800,11,78900,false,false,'2026-06-22'),
  ('Homo Deus','A Brief History of Tomorrow','What happens when old myths meet new godlike technologies such as AI.','homodeus','Yuval Noah Harari','world-history','en',150,false,48600,16,89600,false,false,'2026-05-20'),
  ('Reasons to Stay Alive','A Story of Hope','Matt Haig''s moving exploration of how to feel more alive after depression.','reasons','Matt Haig','wellbeing','en',50,false,14400,6,61200,false,false,'2026-06-27'),
  ('Mastery','The Keys to Success and Fulfillment','Robert Greene reveals the secrets of achieving mastery in any field.','mastery','Robert Greene','entrepreneurship','en',110,false,43200,14,74800,false,false,'2026-06-01'),
  ('The Almanack of Focus','A Practical Guide to Deep Attention','Principles and rituals to reclaim your attention in a distracted world.','focusalmanack','Cal Newport','focus','en',40,false,10800,5,33100,false,false,'2026-07-01'),
  ('Sukoon','سکون — اندرونی سکون کا راستہ','Apne andar sukoon dhoondne ka safar. Rooh ko taskeen dene wali kahaniyan.','sukoon','Ayesha Malik','mindfulness','ur',0,true,12600,6,45600,false,false,'2026-06-30')
) as v(title,subtitle,description,seed,author,subcat,lang,price,is_free,dur,chapters,listens,bom,bod,created)
join public.authors a on a.name = v.author
join public.subcategories s on s.slug = v.subcat
on conflict do nothing;

-- Chapters — generated for every book (chapter 1 = free preview)
insert into public.chapters (book_id, chapter_number, title, audio_path, duration_seconds, is_preview)
select b.id, gs,
  case when gs = 1 then 'Introduction'
       when gs = b.chapter_count then 'Final Thoughts'
       else 'Chapter ' || gs end,
  b.id || '/chapter-' || gs || '.mp3',
  greatest(1, b.duration_seconds / nullif(b.chapter_count,0)),
  (gs = 1)
from public.books b, generate_series(1, b.chapter_count) gs
on conflict (book_id, chapter_number) do nothing;

insert into public.coin_packages (name, coin_amount, bonus_coins, price, currency, sort_order) values
  ('Starter',100,0,199,'PKR',1),('Popular',300,50,499,'PKR',2),
  ('Value',600,150,899,'PKR',3),('Pro',1200,400,1599,'PKR',4)
  on conflict do nothing;

insert into public.payment_configs (country, provider, display_name, description, account_details, qr_code_url, sort_order) values
  ('PK','stripe','Credit / Debit Card','Pay securely with Visa, Mastercard or American Express via Stripe.',null,null,1),
  ('PK','jazzcash','JazzCash','Scan the QR with your JazzCash app, send the amount, then submit your transaction ID and screenshot. Coins are credited after admin approval.','0300-1234567 (ZaraSuno Pvt Ltd)','https://picsum.photos/seed/jazzcashqr/600/600',2),
  ('PK','easypaisa','EasyPaisa','Scan the QR with your EasyPaisa app, send the amount, then submit your transaction ID and screenshot. Coins are credited after admin approval.','0345-7654321 (ZaraSuno Pvt Ltd)','https://picsum.photos/seed/easypaisaqr/600/600',3)
  on conflict do nothing;

insert into public.home_carousels (title, type, category_id, language_code, book_limit, requires_auth, sort_order)
select v.title, v.type,
  (select id from public.categories where slug = v.cat_slug),
  v.lang, v.lim, v.auth, v.so
from (values
  ('Books of the Month','books_of_month',null,null,12,false,1),
  ('Recommended for You','recommended',null,null,12,true,3),
  ('Most Popular','most_popular',null,null,12,false,4),
  ('Recently Added','recently_added',null,null,12,false,5),
  ('Self Development','category','self-development',null,12,false,6),
  ('اردو کتابیں · Urdu Audiobooks','language',null,'ur',12,false,7)
) as v(title,type,cat_slug,lang,lim,auth,so)
on conflict do nothing;

insert into public.content_pages (slug, title, body) values
  ('terms','Terms of Service','<p>Welcome to ZaraSuno. By using our app you agree to these terms.</p><h3>Accounts</h3><p>Keep your credentials secure. One account per person.</p><h3>Coins &amp; Purchases</h3><p>Coins unlock audiobooks and are non-refundable with no cash value.</p>'),
  ('privacy','Privacy Policy','<p>Your privacy matters.</p><h3>What we collect</h3><p>Account details, listening history, and payment records.</p><h3>Your rights</h3><p>Edit your profile or delete your account any time.</p>'),
  ('faq','Frequently Asked Questions','<h3>What is ZaraSuno?</h3><p>An audiobook and book-summary platform in English and Urdu.</p><h3>How do coins work?</h3><p>Buy coin packs, then spend coins to permanently unlock any book.</p><h3>Do coins expire?</h3><p>Never.</p>')
  on conflict (slug) do update set body = excluded.body, title = excluded.title;

insert into public.promocodes (code, coin_reward, max_uses, per_user_limit) values
  ('WELCOME50',50,null,1),('ZARA100',100,500,1)
  on conflict (code) do nothing;

insert into public.notifications (user_id, title, body) values
  (null,'New this month 🎉','Atomic Habits and 3 more titles just landed in Books of the Month.'),
  (null,'Welcome to ZaraSuno','Enjoy 50 free coins on us — start listening today!')
  on conflict do nothing;

-- ============================================================================
-- 6. DEMO LOGIN USER  (demo@zarasuno.app / ZaraSuno123!)
-- ============================================================================
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  '00000000-0000-0000-0000-000000000000',
  '11111111-1111-1111-1111-111111111111',
  'authenticated','authenticated','demo@zarasuno.app',
  crypt('ZaraSuno123!', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Umar Q."}'::jsonb,
  '', '', '', ''
) on conflict (id) do nothing;

insert into auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values (
  '11111111-1111-1111-1111-111111111111',
  '11111111-1111-1111-1111-111111111111',
  '{"sub":"11111111-1111-1111-1111-111111111111","email":"demo@zarasuno.app"}'::jsonb,
  'email', now(), now(), now()
) on conflict do nothing;

-- profile is auto-created by the trigger; enrich it
update public.profiles
  set full_name = 'Umar Q.', coin_balance = 230, country = 'PK',
      preferred_language = 'en', onboarding_completed = true, role = 'admin'
  where id = '11111111-1111-1111-1111-111111111111';

insert into public.user_categories (user_id, category_id)
select '11111111-1111-1111-1111-111111111111', id from public.categories where slug in ('self-development','business-money')
on conflict do nothing;

insert into public.favourites (user_id, book_id)
select '11111111-1111-1111-1111-111111111111', id from public.books where title in ('Sapiens','The Midnight Library','The Psychology of Money')
on conflict do nothing;

insert into public.book_unlocks (user_id, book_id, unlock_method, coins_spent)
select '11111111-1111-1111-1111-111111111111', id, 'coins', coin_price from public.books where title = 'Atomic Habits'
on conflict do nothing;

insert into public.listening_progress (user_id, book_id, position_seconds, is_completed, last_listened_at)
select '11111111-1111-1111-1111-111111111111', b.id, v.pos, v.done, v.ts::timestamptz
from (values ('Atomic Habits',1200,false,'2026-07-03'),('Daring Greatly',18900,true,'2026-06-30'),('Sukoon',2600,false,'2026-06-29')) as v(title,pos,done,ts)
join public.books b on b.title = v.title
on conflict do nothing;

insert into public.transactions (user_id, type, coin_change, amount, currency, payment_provider, payment_status)
values
  ('11111111-1111-1111-1111-111111111111','purchase',350,499,'PKR','stripe','completed'),
  ('11111111-1111-1111-1111-111111111111','spend',-120,null,'PKR','none','completed'),
  ('11111111-1111-1111-1111-111111111111','promo',50,null,'PKR','none','completed');

-- ✅ Done. Login → demo@zarasuno.app / ZaraSuno123!
