-- Auto-create a clickable broadcast notification whenever a book is published.
-- Users get it live (Realtime) and tapping it opens the book. Run once.

alter table public.notifications add column if not exists link text;

create or replace function public.notify_new_book()
returns trigger language plpgsql security definer as $$
begin
  -- fire on first publish (insert published, or update draft -> published)
  if new.is_published
     and (tg_op = 'INSERT' or (tg_op = 'UPDATE' and coalesce(old.is_published, false) = false)) then
    insert into public.notifications (user_id, title, body, image_url, audience, show_in_popup, link)
    values (
      null,
      'New book: ' || new.title,
      coalesce(nullif(new.subtitle, ''), 'Just added — tap to explore.'),
      new.cover_url,
      'all',
      false,
      '/book/' || new.id
    );
  end if;
  return new;
end; $$;

drop trigger if exists on_book_published on public.books;
create trigger on_book_published
after insert or update on public.books
for each row execute function public.notify_new_book();
