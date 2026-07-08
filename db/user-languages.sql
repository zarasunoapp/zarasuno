-- Multiple preferred languages per user (mirrors user_categories).
-- Run once in the Supabase SQL editor.

create table if not exists public.user_languages (
  user_id uuid references public.profiles(id) on delete cascade,
  language_code text references public.languages(code) on delete cascade,
  primary key (user_id, language_code)
);

alter table public.user_languages enable row level security;

do $$ begin
  create policy "own langs" on public.user_languages
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "admin all user_languages" on public.user_languages
    for all using (public.is_admin());
exception when duplicate_object then null; end $$;
