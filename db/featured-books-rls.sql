-- Ensure the anon key can read active featured books (public homepage band).
-- Idempotent — safe to run in the Supabase SQL editor.

alter table public.featured_books enable row level security;

do $$ begin
  create policy "public read featured_books" on public.featured_books
    for select using (is_active);
exception when duplicate_object then null; end $$;
