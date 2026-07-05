import { notFound } from "next/navigation";
import { getBookById, getChaptersForBook, getAuthorById } from "@/lib/queries";
import PlayerClient from "@/components/PlayerClient";

export const dynamic = "force-dynamic";

export default async function ListenPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { ch?: string };
}) {
  const book = await getBookById(params.id);
  if (!book) notFound();
  const [chapters, author] = await Promise.all([
    getChaptersForBook(book.id),
    getAuthorById(book.author_id),
  ]);

  const initialIndex = Math.max(0, Math.min(chapters.length - 1, Number(searchParams.ch ?? 0) || 0));

  return <PlayerClient book={book} author={author} chapters={chapters} initialIndex={initialIndex} />;
}
