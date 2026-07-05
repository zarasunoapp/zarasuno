import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Returns a short-lived signed URL for a chapter's audio from the PRIVATE
// book-audio bucket — only if the chapter is a preview, the book is free, or
// the logged-in user has unlocked the book. The raw path is never exposed.
export async function GET(req: Request) {
  const chapterId = new URL(req.url).searchParams.get("chapter");
  if (!chapterId) return NextResponse.json({ error: "missing_chapter" }, { status: 400 });

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: chapter } = await supabase
    .from("chapters")
    .select("audio_path, book_id, is_preview")
    .eq("id", chapterId)
    .maybeSingle();
  if (!chapter?.audio_path) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const { data: book } = await supabase
    .from("books")
    .select("is_free")
    .eq("id", chapter.book_id)
    .maybeSingle();

  let allowed = !!book?.is_free || !!chapter.is_preview;
  if (!allowed && user) {
    const { data: unlock } = await supabase
      .from("book_unlocks")
      .select("id")
      .eq("user_id", user.id)
      .eq("book_id", chapter.book_id)
      .maybeSingle();
    allowed = !!unlock;
  }
  if (!allowed) return NextResponse.json({ error: "locked" }, { status: 403 });

  // service role signs the private object (after our access check above)
  const admin = createAdminClient();
  const { data, error } = await admin.storage
    .from("book-audio")
    .createSignedUrl(chapter.audio_path, 3600);

  if (error || !data?.signedUrl) {
    return NextResponse.json({ error: "audio_unavailable" }, { status: 404 });
  }
  return NextResponse.json({ url: data.signedUrl });
}
