-- Ensure the anon key can read active testimonials (public "what listeners say"
-- section). Optional — only needed if you enable RLS on the table.

alter table public.testimonials enable row level security;

do $$ begin
  create policy "public read testimonials" on public.testimonials
    for select using (is_active);
exception when duplicate_object then null; end $$;
