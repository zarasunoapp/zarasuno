import { notFound } from "next/navigation";
import {
  getBookById, getChaptersForBook, getAuthorById, getAllBooks,
} from "@/lib/queries";
import BookDetailClient from "@/components/BookDetailClient";

export const dynamic = "force-dynamic";

export default async function BookPage({ params }: { params: { id: string } }) {
  const book = await getBookById(params.id);
  if (!book) notFound();

  const [author, chapters, allBooks] = await Promise.all([
    getAuthorById(book.author_id),
    getChaptersForBook(book.id),
    getAllBooks(),
  ]);

  const related = allBooks
    .filter((b) => b.id !== book.id)
    .sort((a, b) => b.listen_count - a.listen_count)
    .slice(0, 8);

  return (
    <BookDetailClient
      book={book}
      author={author}
      chapters={chapters}
      categoryName={book.category_name ?? null}
      related={related}
    />
  );
}
