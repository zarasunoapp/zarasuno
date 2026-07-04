import { notFound } from "next/navigation";
import { getBookById, getChaptersForBook, getAuthorById } from "@/lib/queries";
import PlayerClient from "@/components/PlayerClient";

export const dynamic = "force-dynamic";

export default async function ListenPage({ params }: { params: { id: string } }) {
  const book = await getBookById(params.id);
  if (!book) notFound();
  const [chapters, author] = await Promise.all([
    getChaptersForBook(book.id),
    getAuthorById(book.author_id),
  ]);

  return <PlayerClient book={book} author={author} chapters={chapters} />;
}
