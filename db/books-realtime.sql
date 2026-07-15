-- OPTIONAL — only if the admin dashboard should update click counts live
-- (without a refresh). Enables Supabase Realtime on books so the admin panel
-- can subscribe to UPDATE events and re-render listen_count instantly.
--
-- The counting itself is already instant without this: every book open calls
-- increment_book_click() and books.listen_count goes +1 immediately.

alter table public.books replica identity full;

do $$ begin
  alter publication supabase_realtime add table public.books;
exception when duplicate_object then null; end $$;
