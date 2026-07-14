-- Per-country pricing for coin packages. Run once in the Supabase SQL editor.
-- The website shows/charges the country price when one exists for the user's
-- profiles.country; otherwise it falls back to coin_packages.price (default).

create table if not exists public.coin_package_prices (
  id uuid primary key default uuid_generate_v4(),
  package_id uuid not null references public.coin_packages(id) on delete cascade,
  country_code text not null,          -- ISO 3166-1 alpha-2, e.g. 'PK', 'AU', 'US'
  price numeric(10,2) not null,
  currency text not null,              -- e.g. 'PKR', 'AUD', 'USD'
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (package_id, country_code)
);

alter table public.coin_package_prices enable row level security;

do $$ begin
  create policy "public read coin_package_prices" on public.coin_package_prices
    for select using (is_active);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "admin all coin_package_prices" on public.coin_package_prices
    for all using (public.is_admin());
exception when duplicate_object then null; end $$;

-- Example (optional) — Australia prices in AUD for each package:
--   insert into public.coin_package_prices (package_id, country_code, price, currency)
--   select id, 'AU', round(price/180.0, 2), 'AUD' from public.coin_packages
--   on conflict (package_id, country_code) do nothing;
