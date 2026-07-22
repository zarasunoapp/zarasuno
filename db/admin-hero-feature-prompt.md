# Admin Panel — "Hero Featured Book" section (build prompt)

Paste this to whoever builds the ZaraSuno admin panel. It describes ONE new
admin section that controls the book shown inside the phone on the public
landing-hero, plus its 1-minute audio sample.

The website side is already built and reads from the `hero_features` table and
the public `hero-samples` storage bucket (created by `db/hero-feature.sql` — run
that first).

---

## What to build

A new admin page/section called **"Hero Featured Book"** that lets an admin
choose which real book appears in the homepage hero phone, upload a short
(~1 minute) audio sample for it, and toggle it on/off.

### Data model (already in the DB)

Table `public.hero_features`:

| column             | type      | notes                                                        |
|--------------------|-----------|--------------------------------------------------------------|
| `id`               | uuid (pk) | default generated                                            |
| `book_id`          | uuid      | FK → `books.id` (the real book to feature)                   |
| `sample_audio_url` | text      | PUBLIC URL of the ~1-min sample in the `hero-samples` bucket |
| `sample_label`     | text      | small caption, default `"Free 1-min sample"`                 |
| `is_active`        | boolean   | only active rows show on the site; default `true`            |
| `sort_order`       | integer   | if multiple active, lowest `sort_order` wins; default `0`    |
| `created_at`       | timestamptz |                                                            |
| `updated_at`       | timestamptz | auto-updated by trigger                                    |

The website uses the **first active row** (`is_active = true`, ordered by
`sort_order` asc, then `created_at` desc). Title, author and cover are pulled
LIVE from the linked `books` row — the admin only picks the book + uploads audio.

### Storage

Bucket **`hero-samples`** (public). Upload the 1-min sample here; store its
public URL in `sample_audio_url`. Keep it separate from the private `book-audio`
bucket (that one holds the full paid audio and must stay private).

Suggested object path: `hero-samples/<book_id>-<timestamp>.mp3`.

### UI requirements

1. **Book picker (real-time):** a searchable dropdown / typeahead that queries
   `books` (`select id, title, cover_url, authors(name) where is_published = true`)
   and filters by title as the admin types. Show the cover thumbnail + title +
   author in each option. Selecting sets `book_id`.
2. **Audio sample upload:** file input (accept `audio/*`). On upload:
   - client-side guard: warn if longer than ~75s (the design expects ~1 min),
   - upload to the `hero-samples` bucket,
   - save the resulting public URL into `sample_audio_url`.
   Also show an inline `<audio controls>` preview of the current sample.
3. **Sample label** text field (optional, defaults to "Free 1-min sample").
4. **Active toggle** (`is_active`) and a **sort order** number.
5. **Live preview** (nice-to-have): render a small phone mockup mirroring the
   site so the admin sees title/author/cover + a play button before saving.
6. **Save / Update / Delete** — upsert into `hero_features`. Typically there's
   just one active row; setting a new one active can auto-deactivate the others
   (optional): `update hero_features set is_active = false where id <> :id`.

### Permissions

`hero_features` has RLS: public can SELECT active rows; **only admins**
(`public.is_admin()`) can insert/update/delete. The admin panel must act as an
authenticated admin (or use the service-role key server-side) for writes and for
uploading to `hero-samples`.

### Acceptance criteria

- Admin selects a real book → saves → the homepage hero phone immediately shows
  that book's real cover, title and author.
- Admin uploads a 1-min sample → on the homepage, pressing play in the phone
  plays that audio; the progress bar and time reflect the real audio.
- The phone's "Explore this full book" button opens `/book/<book_id>` (the same
  page a carousel book opens).
- Toggling `is_active` off (with no other active row) makes the hero fall back to
  a normal cover with no audio — no errors.
