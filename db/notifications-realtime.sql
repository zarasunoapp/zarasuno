-- Enable Supabase Realtime for live notifications. Run once in the SQL editor.
-- (The read RLS policy "own notifs" already allows user_id IS NULL OR auth.uid()=user_id.)

alter table public.notifications replica identity full;

do $$ begin
  alter publication supabase_realtime add table public.notifications;
exception when duplicate_object then null; end $$;
