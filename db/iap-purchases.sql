-- In-app purchases (Apple StoreKit / Google Play Billing) for the mobile app.
--
-- The mobile app sells coin packs through the stores on iOS (App Store policy
-- 3.1.1 requires IAP for digital goods). credit_coin_purchase() hardcodes
-- payment_provider='stripe', so IAP needs its own crediting function plus two
-- new allowed provider values.
--
-- Run once in the Supabase SQL editor.

-- 1. Allow 'apple' / 'google' as payment providers -----------------------------
alter table public.transactions drop constraint if exists transactions_payment_provider_check;

alter table public.transactions
  add constraint transactions_payment_provider_check
  check (payment_provider in ('stripe','jazzcash','easypaisa','manual','none','promo','apple','google'));

-- 2. Credit an IAP purchase (idempotent on the store transaction id) -----------
create or replace function public.credit_iap_purchase(
  p_user_id uuid,
  p_coins integer,
  p_amount numeric,
  p_currency text,
  p_package_id uuid,
  p_reference text,
  p_provider text
) returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_email text;
  v_name text;
  v_balance integer;
  v_pkg text;
begin
  if p_provider not in ('apple','google') then
    return jsonb_build_object('credited', false, 'error', 'bad_provider');
  end if;

  -- The store transaction id is unique per purchase, so replaying the same
  -- receipt (retry, restore, re-launch) can never double-credit.
  if exists (select 1 from public.transactions where payment_reference = p_reference) then
    return jsonb_build_object('credited', false);
  end if;

  update public.profiles set coin_balance = coin_balance + p_coins
    where id = p_user_id
    returning email, full_name, coin_balance into v_email, v_name, v_balance;

  if not found then
    return jsonb_build_object('credited', false, 'error', 'user_not_found');
  end if;

  insert into public.transactions
    (user_id, type, coin_change, amount, currency, package_id,
     payment_provider, payment_status, payment_reference)
  values
    (p_user_id, 'purchase', p_coins, p_amount, coalesce(p_currency, 'USD'), p_package_id,
     p_provider, 'completed', p_reference);

  select name into v_pkg from public.coin_packages where id = p_package_id;

  return jsonb_build_object(
    'credited', true,
    'email', v_email,
    'name', v_name,
    'balance', v_balance,
    'coins', p_coins,
    'package_name', v_pkg
  );
end; $$;

grant execute on function public.credit_iap_purchase(uuid, integer, numeric, text, uuid, text, text) to service_role;

-- 3. Map store product ids → coin packages ------------------------------------
-- The client tells us which product it bought; the server must resolve that to a
-- package itself rather than trusting a client-supplied package id.
create table if not exists public.iap_products (
  product_id text primary key,
  platform text not null check (platform in ('ios','android')),
  package_id uuid not null references public.coin_packages(id) on delete cascade,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.iap_products enable row level security;

do $$ begin
  create policy "iap products readable" on public.iap_products
    for select using (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "admin all iap_products" on public.iap_products
    for all using (public.is_admin());
exception when duplicate_object then null; end $$;

-- Example (fill in with the real App Store Connect product ids + package uuids):
--   insert into public.iap_products (product_id, platform, package_id) values
--     ('app.zarasuno.coins.100',  'ios', '<coin_packages.id>'),
--     ('app.zarasuno.coins.500',  'ios', '<coin_packages.id>'),
--     ('app.zarasuno.coins.1200', 'ios', '<coin_packages.id>');
