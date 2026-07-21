import Link from "next/link";
import { Headphones } from "lucide-react";
import type { FeaturedBook } from "@/lib/queries";

// Featured Books band — small, compact tiles (2 per row on mobile → 6 on desktop),
// images only. Admin-managed via the featured_books table.
export default function FeaturedBooks({ featured }: { featured: FeaturedBook[] }) {
  if (!featured.length) return null;

  return (
    <section className="mx-auto max-w-[96rem] px-4 sm:px-6">
      <div className="mb-6 flex items-center justify-center gap-3">
        <Headphones className="h-5 w-5 text-brand-500" />
        <h2 className="display text-2xl uppercase text-brand-700 sm:text-3xl">featured books</h2>
        <Headphones className="h-5 w-5 -scale-x-100 text-brand-500" />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 lg:grid-cols-6">
        {featured.map((f) => {
          const img = (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={f.image_url}
              alt={f.title ?? "Featured book"}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          );
          const cls =
            "group relative aspect-square overflow-hidden rounded-2xl shadow-card ring-1 ring-black/5 transition-all hover:-translate-y-1 hover:shadow-cardHover";
          return f.book_id ? (
            <Link key={f.id} href={`/book/${f.book_id}`} className={cls}>{img}</Link>
          ) : (
            <div key={f.id} className={cls}>{img}</div>
          );
        })}
      </div>
    </section>
  );
}
