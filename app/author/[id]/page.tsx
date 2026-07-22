import { notFound } from "next/navigation";
import { getAuthorById, getBooksByAuthor } from "@/lib/queries";
import Avatar from "@/components/Avatar";
import BookCard from "@/components/BookCard";
import BackButton from "@/components/BackButton";

export const dynamic = "force-dynamic";

export default async function AuthorPage({ params }: { params: { id: string } }) {
  const [author, books] = await Promise.all([
    getAuthorById(params.id),
    getBooksByAuthor(params.id),
  ]);
  if (!author) notFound();

  return (
    <div className="mx-auto max-w-[96rem] px-4 py-8 pb-28 sm:px-6 md:pb-12">
      <BackButton />


      <div className="mt-6 flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:text-left">
        {author.avatar_url ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={author.avatar_url} alt={author.name} className="h-24 w-24 rounded-full object-cover shadow-card ring-4 ring-white" />
        ) : (
          <Avatar name={author.name} size={96} className="shadow-card ring-4 ring-white" />
        )}
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold-500">Author</p>
          <h1 className="display text-3xl text-gray-900 sm:text-4xl">Books by {author.name}</h1>
          <p className="mt-1 text-sm text-gray-500">{books.length} {books.length === 1 ? "title" : "titles"}</p>
        </div>
      </div>

      {books.length === 0 ? (
        <div className="mt-12 grid place-items-center rounded-3xl bg-gray-50 py-20 text-center text-gray-400 ring-1 ring-black/5">
          No books from this author yet.
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:justify-center sm:gap-5">
          {books.map((b) => <BookCard key={b.id} book={b} fluid />)}
        </div>
      )}
    </div>
  );
}
