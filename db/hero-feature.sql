-- ============================================================================
-- HERO "featured book in the phone" — admin-managed
-- ----------------------------------------------------------------------------
-- The landing hero shows a phone mockup. This makes that phone show a REAL book
-- (cover/title/author come from the books table) plus a short (~1 min) audio
-- sample the visitor can play, and an "Explore this full book" link that opens
-- the real /book/[id] page (same as a carousel book).
--
-- Run this whole file once in the Supabase SQL editor.
-- ============================================================================

-- 1) Storage bucket for the ~1-minute samples ---------------------------------
-- Kept SEPARATE from the private 'book-audio' bucket (full paid audio stays
-- private). This one is PUBLIC so signed-out visitors can play the teaser.
insert into storage.buckets (id, name, public) values
  ('hero-samples','hero-samples', true)
  on conflict (id) do nothing;

-- Public read + admin write for the hero-samples bucket.
-- (Safe to skip if your admin panel uploads with the service-role key.)
do $$ begin
  begin
    create policy "hero samples public read" on storage.objects
      for select using (bucket_id = 'hero-samples');
  exception when duplicate_object then null; end;
  begin
    create policy "hero samples admin write" on storage.objects
      for all using (bucket_id = 'hero-samples' and public.is_admin())
      with check (bucket_id = 'hero-samples' and public.is_admin());
  exception when duplicate_object then null; end;
end $$;

-- 2) The hero feature table ---------------------------------------------------
create table if not exists public.hero_features (
  id uuid primary key default uuid_generate_v4(),
  book_id uuid references public.books(id) on delete cascade,
  sample_audio_url text,                       -- public URL of the ~1 min sample
  sample_label text default 'Free 1-min sample',
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_hero_active on public.hero_features(is_active, sort_order);

alter table public.hero_features enable row level security;

do $$ begin
  begin
    -- anyone can read the active hero (it's on the public landing page)
    create policy "hero public read" on public.hero_features
      for select using (is_active = true or public.is_admin());
  exception when duplicate_object then null; end;
  begin
    -- only admins can create/update/delete
    create policy "admin all hero" on public.hero_features
      for all using (public.is_admin()) with check (public.is_admin());
  exception when duplicate_object then null; end;
end $$;

-- keep updated_at fresh
create or replace function public.touch_hero_features()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists trg_touch_hero on public.hero_features;
create trigger trg_touch_hero before update on public.hero_features
  for each row execute function public.touch_hero_features();

-- 3) (optional) seed one row from an existing book so the hero isn't empty ----
-- Replace the audio URL after you upload a sample; or just insert from the admin UI.
-- insert into public.hero_features (book_id, sample_audio_url)
-- select id, null from public.books where is_published = true order by created_at desc limit 1;
