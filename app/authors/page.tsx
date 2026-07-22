import Link from "next/link";
import { getAllAuthors } from "@/lib/queries";
import Avatar from "@/components/Avatar";
import BackButton from "@/components/BackButton";

export const dynamic = "force-dynamic";

export default async function AuthorsPage() {
  const authors = await getAllAuthors();

  // group by first letter (non-letters bucket under "#")
  const groups = new Map<string, typeof authors>();
  for (const a of authors) {
    const c = (a.name?.trim()?.[0] ?? "#").toUpperCase();
    const key = /[A-Z]/.test(c) ? c : "#";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(a);
  }
  const letters = Array.from(groups.keys()).sort((a, b) => (a === "#" ? 1 : b === "#" ? -1 : a.localeCompare(b)));

  return (
    <div className="mx-auto max-w-[96rem] px-4 py-8 pb-28 sm:px-6 md:pb-12">
      <BackButton />

      <div className="mt-6">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold-500">Voices you&apos;ll love</p>
        <h1 className="display text-3xl text-gray-900 sm:text-4xl">Browse by author</h1>
        <p className="mt-1 text-sm text-gray-500">{authors.length} {authors.length === 1 ? "author" : "authors"}</p>
      </div>

      {/* A–Z quick jump */}
      {letters.length > 1 && (
        <div className="no-scrollbar sticky top-20 z-10 -mx-4 mt-5 flex gap-1.5 overflow-x-auto bg-ivory/80 px-4 py-2 backdrop-blur sm:mx-0 sm:flex-wrap sm:rounded-2xl sm:px-3">
          {letters.map((l) => (
            <a key={l} href={`#letter-${l}`} className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-bold text-brand-700 ring-1 ring-brand-100 transition hover:bg-brand-900 hover:text-white">
              {l}
            </a>
          ))}
        </div>
      )}

      {authors.length === 0 ? (
        <div className="mt-12 grid place-items-center rounded-3xl bg-gray-50 py-20 text-center text-gray-400 ring-1 ring-black/5">
          No authors yet.
        </div>
      ) : (
        <div className="mt-8 space-y-10">
          {letters.map((l) => (
            <section key={l} id={`letter-${l}`} className="scroll-mt-32">
              <div className="mb-4 flex items-center gap-4">
                <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-brand-900 font-serif text-2xl font-bold text-gold-300 shadow-card">{l}</span>
                <div className="h-px flex-1 bg-gradient-to-r from-brand-100 to-transparent" />
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {groups.get(l)!.map((a) => (
                  <Link
                    key={a.id}
                    href={`/author/${a.id}`}
                    className="group flex items-center gap-3 rounded-2xl bg-white p-3 shadow-soft ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-card"
                  >
                    {a.avatar_url ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={a.avatar_url} alt={a.name} className="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-white shadow-soft" />
                    ) : (
                      <Avatar name={a.name} size={48} className="shrink-0 ring-2 ring-white shadow-soft" />
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-gray-900 group-hover:text-brand-700">{a.name}</p>
                      <p className="text-xs text-gray-400">{a.book_count} {a.book_count === 1 ? "book" : "books"}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
