-- ============================================================================
-- Stamp the applied promo code onto the purchase transaction.
-- On a completed coin purchase with a promo applied:
--   transactions.promocode_id = <applied promocode id>
-- promocode_redemptions is still inserted as before ('uses' count comes from it).
-- Run once in the Supabase SQL editor.
-- ============================================================================

-- 1) New column on transactions (nullable; only set when a promo was applied).
alter table public.transactions
  add column if not exists promocode_id uuid references public.promocodes(id);

create index if not exists idx_txn_promocode on public.transactions(promocode_id);

-- 2) Update the active credit RPC (jsonb version) to write promocode_id.
--    Signature unchanged — it already receives p_promocode_id.
create or replace function public.credit_coin_purchase(
  p_user_id uuid,
  p_coins integer,
  p_amount numeric,
  p_package_id uuid,
  p_reference text,
  p_promocode_id uuid default null
) returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_email text;
  v_name text;
  v_balance integer;
  v_pkg text;
begin
  if exists (select 1 from public.transactions where payment_reference = p_reference) then
    return jsonb_build_object('credited', false); -- already processed
  end if;

  update public.profiles set coin_balance = coin_balance + p_coins
    where id = p_user_id
    returning email, full_name, coin_balance into v_email, v_name, v_balance;

  insert into public.transactions
    (user_id, type, coin_change, amount, currency, package_id,
     payment_provider, payment_status, payment_reference, promocode_id)
  values
    (p_user_id, 'purchase', p_coins, p_amount, 'PKR', p_package_id,
     'stripe', 'completed', p_reference, p_promocode_id);

  if p_promocode_id is not null then
    insert into public.promocode_redemptions (promocode_id, user_id) values (p_promocode_id, p_user_id);
    update public.promocodes set used_count = coalesce(used_count, 0) + 1 where id = p_promocode_id;
  end if;

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

grant execute on function public.credit_coin_purchase(uuid, integer, numeric, uuid, text, uuid) to service_role;
