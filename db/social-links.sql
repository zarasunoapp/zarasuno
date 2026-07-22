-- ============================================================================
-- Social links (footer) — stored in app_settings, key = 'socials'
-- Read on the frontend with the anon key. Run this once in the Supabase SQL editor.
-- ============================================================================

-- 1) Let the anon key read app_settings (needed for the footer to load socials).
do $$ begin
  begin
    create policy "public read app_settings" on public.app_settings
      for select to anon, authenticated using (true);
  exception when duplicate_object then null; end;
end $$;

-- 2) Seed / update the socials row. Full URLs; leave a value as "" to hide that icon.
insert into public.app_settings (key, value)
values (
  'socials',
  '{
    "facebook":  "https://facebook.com/zarasuno",
    "instagram": "https://instagram.com/zarasuno",
    "twitter":   "https://x.com/zarasuno",
    "tiktok":    "https://tiktok.com/@zarasuno"
  }'::jsonb
)
on conflict (key) do update set value = excluded.value, updated_at = now();
