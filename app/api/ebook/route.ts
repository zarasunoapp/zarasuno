import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Returns a short-lived signed URL for a book's eBook file (PDF/EPUB) from the
// PRIVATE `ebooks` bucket — only if the book is free or the logged-in user has
// unlocked it. Path is read from books.metadata->>'ebook_file' and never exposed.
export async function GET(req: Request) {
  const bookId = new URL(req.url).searchParams.get("book");
  if (!bookId) return NextResponse.json({ error: "missing_book" }, { status: 400 });

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: book } = await supabase
    .from("books")
    .select("is_free, metadata")
    .eq("id", bookId)
    .maybeSingle();

  const path = (book?.metadata as { ebook_file?: string } | null)?.ebook_file;
  if (!path) return NextResponse.json({ error: "not_found" }, { status: 404 });

  let allowed = !!book?.is_free;
  if (!allowed && user) {
    const { data: unlock } = await supabase
      .from("book_unlocks")
      .select("id")
      .eq("user_id", user.id)
      .eq("book_id", bookId)
      .maybeSingle();
    allowed = !!unlock;
  }
  if (!allowed) return NextResponse.json({ error: "locked" }, { status: 403 });

  // service role signs the private object (after our access check above)
  const admin = createAdminClient();
  const { data, error } = await admin.storage.from("ebooks").createSignedUrl(path, 3600);
  if (error || !data?.signedUrl) {
    return NextResponse.json({ error: "ebook_unavailable" }, { status: 404 });
  }
  return NextResponse.json({ url: data.signedUrl });
}
