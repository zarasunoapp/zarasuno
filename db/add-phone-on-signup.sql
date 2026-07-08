-- Store the optional phone number captured at signup into profiles.phone.
-- The `profiles.phone` column already exists — this just teaches the
-- new-user trigger to copy it from the signup metadata.
-- Run once in the Supabase SQL editor.

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, full_name, phone)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    nullif(new.raw_user_meta_data->>'phone', '')
  )
  on conflict (id) do nothing;
  return new;
end; $$;
