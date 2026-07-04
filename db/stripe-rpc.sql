-- ============================================================================
-- Stripe → coins crediting RPC.  Run once in Supabase SQL Editor.
-- Called by the Stripe webhook (service role). Idempotent: the Stripe session
-- id is used as payment_reference, so replays never double-credit.
-- ============================================================================
create or replace function public.credit_coin_purchase(
  p_user_id uuid,
  p_coins integer,
  p_amount numeric,
  p_package_id uuid,
  p_reference text
) returns void
language plpgsql
security definer
as $$
begin
  -- already processed this Stripe session? do nothing.
  if exists (select 1 from public.transactions where payment_reference = p_reference) then
    return;
  end if;

  update public.profiles
    set coin_balance = coin_balance + p_coins
    where id = p_user_id;

  insert into public.transactions
    (user_id, type, coin_change, amount, currency, package_id,
     payment_provider, payment_status, payment_reference)
  values
    (p_user_id, 'purchase', p_coins, p_amount, 'PKR', p_package_id,
     'stripe', 'completed', p_reference);
end;
$$;
