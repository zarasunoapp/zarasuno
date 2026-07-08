-- ============================================================================
-- Promocode redemption — server-side, atomic, never trusts the client.
-- Run once in the Supabase SQL editor (same project as the admin panel).
--
-- Assumes the admin-panel schema:
--   promocodes(id, name, code, is_active, starts_at, expires_at, max_uses,
--              used_count, per_user_limit, reward_type 'coins'|'discount',
--              coin_reward, discount_percent, package_id)
--   promocode_redemptions(id, promocode_id, user_id, created_at)
--   coin_packages(id, name, coin_amount, bonus_coins, price, currency, is_active)
--   transactions(...), profiles(coin_balance)
-- ============================================================================

-- Allow 'promo' as a payment_provider (used for free-coin grants).
-- Safe/idempotent for the default constraint name.
do $$ begin
  alter table public.transactions drop constraint if exists transactions_payment_provider_check;
  alter table public.transactions add constraint transactions_payment_provider_check
    check (payment_provider in ('stripe','jazzcash','easypaisa','manual','none','promo'));
exception when others then null; end $$;

-- ----------------------------------------------------------------------------
-- Validate a DISCOUNT code against a package. Read-only (no redemption here).
-- Returns { success, error? , promocode_id, discount_percent,
--           original_price, final_price, coin_amount, package_id }
-- ----------------------------------------------------------------------------
create or replace function public.validate_discount_promo(p_code text, p_package_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_promo public.promocodes;
  v_used integer;
  v_pkg public.coin_packages;
begin
  if v_uid is null then return jsonb_build_object('success', false, 'error', 'not_authenticated'); end if;

  select * into v_promo from public.promocodes where lower(code) = lower(trim(p_code));
  if not found then return jsonb_build_object('success', false, 'error', 'invalid'); end if;
  if not coalesce(v_promo.is_active, false) then return jsonb_build_object('success', false, 'error', 'inactive'); end if;
  if v_promo.reward_type <> 'discount' then return jsonb_build_object('success', false, 'error', 'not_a_discount_code'); end if;
  if v_promo.starts_at is not null and now() < v_promo.starts_at then return jsonb_build_object('success', false, 'error', 'not_started'); end if;
  if v_promo.expires_at is not null and now() > v_promo.expires_at then return jsonb_build_object('success', false, 'error', 'expired'); end if;
  if v_promo.max_uses is not null and coalesce(v_promo.used_count, 0) >= v_promo.max_uses then
    return jsonb_build_object('success', false, 'error', 'exhausted');
  end if;
  if v_promo.per_user_limit is not null then
    select count(*) into v_used from public.promocode_redemptions where promocode_id = v_promo.id and user_id = v_uid;
    if v_used >= v_promo.per_user_limit then return jsonb_build_object('success', false, 'error', 'already_used'); end if;
  end if;

  -- package-scoped code must match the chosen package
  if v_promo.package_id is not null and v_promo.package_id <> p_package_id then
    return jsonb_build_object('success', false, 'error', 'not_applicable_to_package');
  end if;

  select * into v_pkg from public.coin_packages where id = p_package_id and coalesce(is_active, true) = true;
  if not found then return jsonb_build_object('success', false, 'error', 'package_not_found'); end if;

  return jsonb_build_object(
    'success', true,
    'promocode_id', v_promo.id,
    'discount_percent', v_promo.discount_percent,
    'original_price', v_pkg.price,
    'final_price', round(v_pkg.price * (1 - coalesce(v_promo.discount_percent, 0) / 100.0), 2),
    'coin_amount', v_pkg.coin_amount,
    'package_id', p_package_id
  );
end; $$;

-- ----------------------------------------------------------------------------
-- Apply a code from the checkout "Have a promo code?" box.
--  • coins    → grants coins instantly (atomic) and returns the new balance
--  • discount → validates + returns the discounted price (NO coins/redeem yet;
--               the redemption happens on successful payment)
-- Returns { success, error?, mode:'coins'|'discount', ... }
-- ----------------------------------------------------------------------------
create or replace function public.apply_promocode(p_code text, p_package_id uuid default null)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_promo public.promocodes;
  v_used integer;
  v_balance integer;
  v_result jsonb;
begin
  if v_uid is null then return jsonb_build_object('success', false, 'error', 'not_authenticated'); end if;

  -- lock the promocode row so used_count / per-user checks are race-free
  select * into v_promo from public.promocodes where lower(code) = lower(trim(p_code)) for update;
  if not found then return jsonb_build_object('success', false, 'error', 'invalid'); end if;
  if not coalesce(v_promo.is_active, false) then return jsonb_build_object('success', false, 'error', 'inactive'); end if;
  if v_promo.starts_at is not null and now() < v_promo.starts_at then return jsonb_build_object('success', false, 'error', 'not_started'); end if;
  if v_promo.expires_at is not null and now() > v_promo.expires_at then return jsonb_build_object('success', false, 'error', 'expired'); end if;
  if v_promo.max_uses is not null and coalesce(v_promo.used_count, 0) >= v_promo.max_uses then
    return jsonb_build_object('success', false, 'error', 'exhausted');
  end if;
  if v_promo.per_user_limit is not null then
    select count(*) into v_used from public.promocode_redemptions where promocode_id = v_promo.id and user_id = v_uid;
    if v_used >= v_promo.per_user_limit then return jsonb_build_object('success', false, 'error', 'already_used'); end if;
  end if;

  if v_promo.reward_type = 'coins' then
    update public.profiles set coin_balance = coin_balance + coalesce(v_promo.coin_reward, 0)
      where id = v_uid returning coin_balance into v_balance;
    insert into public.promocode_redemptions (promocode_id, user_id) values (v_promo.id, v_uid);
    insert into public.transactions
      (user_id, type, coin_change, amount, currency, payment_provider, payment_status)
    values
      (v_uid, 'admin_grant', coalesce(v_promo.coin_reward, 0), 0, 'PKR', 'promo', 'completed');
    update public.promocodes set used_count = coalesce(used_count, 0) + 1 where id = v_promo.id;
    return jsonb_build_object('success', true, 'mode', 'coins',
      'coins', coalesce(v_promo.coin_reward, 0), 'new_balance', v_balance);

  elsif v_promo.reward_type = 'discount' then
    if p_package_id is null then return jsonb_build_object('success', false, 'error', 'select_package'); end if;
    v_result := public.validate_discount_promo(p_code, p_package_id);
    if coalesce((v_result->>'success')::boolean, false) then
      v_result := v_result || jsonb_build_object('mode', 'discount');
    end if;
    return v_result;

  else
    return jsonb_build_object('success', false, 'error', 'unknown_reward_type');
  end if;
end; $$;

-- ----------------------------------------------------------------------------
-- Credit coins on a successful payment. Idempotent on p_reference (Stripe id).
-- When p_promocode_id is supplied (discount code), also records the redemption
-- and bumps used_count — all inside the same idempotent guard.
-- ----------------------------------------------------------------------------
drop function if exists public.credit_coin_purchase(uuid, integer, numeric, uuid, text);

create or replace function public.credit_coin_purchase(
  p_user_id uuid,
  p_coins integer,
  p_amount numeric,
  p_package_id uuid,
  p_reference text,
  p_promocode_id uuid default null
) returns void language plpgsql security definer set search_path = public as $$
begin
  if exists (select 1 from public.transactions where payment_reference = p_reference) then
    return; -- already processed this payment
  end if;

  update public.profiles set coin_balance = coin_balance + p_coins where id = p_user_id;

  insert into public.transactions
    (user_id, type, coin_change, amount, currency, package_id,
     payment_provider, payment_status, payment_reference)
  values
    (p_user_id, 'purchase', p_coins, p_amount, 'PKR', p_package_id,
     'stripe', 'completed', p_reference);

  if p_promocode_id is not null then
    insert into public.promocode_redemptions (promocode_id, user_id) values (p_promocode_id, p_user_id);
    update public.promocodes set used_count = coalesce(used_count, 0) + 1 where id = p_promocode_id;
  end if;
end; $$;

grant execute on function public.validate_discount_promo(text, uuid) to authenticated;
grant execute on function public.apply_promocode(text, uuid) to authenticated;
grant execute on function public.credit_coin_purchase(uuid, integer, numeric, uuid, text, uuid) to service_role;
