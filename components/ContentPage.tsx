import { getContentPage } from "@/lib/queries";
import { notFound } from "next/navigation";

// Renders admin-controlled HTML stored in content_pages.body.
export default async function ContentPage({ slug }: { slug: string }) {
  const page = await getContentPage(slug);
  if (!page) notFound();

  return (
    <div className="min-h-screen bg-white">
      {/* dark themed header — tucked under the floating navbar like the homepage hero */}
      <div className="grain relative -mt-20 overflow-hidden bg-brand-900 pb-16 pt-32 text-white sm:pt-36">
        <div className="absolute inset-0 bg-hero-mesh opacity-60" />
        <div className="relative mx-auto max-w-3xl px-4 sm:px-6">
          <h1 className="display text-4xl text-white sm:text-5xl">{page.title}</h1>
          <p className="mt-3 text-sm text-brand-100">
            Last updated {new Date(page.updated_at ?? Date.now()).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* rendered HTML body */}
      <div className="mx-auto max-w-3xl px-4 pb-28 pt-10 sm:px-6 md:pb-16">
        <div
          className="prose-content space-y-4 text-[15px] leading-relaxed text-gray-600
            [&_a]:font-medium [&_a]:text-brand-700 [&_a]:underline hover:[&_a]:text-brand-500
            [&_h1]:mt-8 [&_h1]:font-serif [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-gray-900
            [&_h2]:mt-8 [&_h2]:font-serif [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-gray-900
            [&_h3]:mt-6 [&_h3]:font-serif [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-gray-900
            [&_h4]:mt-5 [&_h4]:font-semibold [&_h4]:text-gray-900
            [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-6
            [&_ol]:list-decimal [&_ol]:space-y-1.5 [&_ol]:pl-6
            [&_li]:leading-relaxed [&_strong]:font-semibold [&_strong]:text-gray-900
            [&_blockquote]:border-l-4 [&_blockquote]:border-gold-300 [&_blockquote]:bg-gold-50 [&_blockquote]:px-4 [&_blockquote]:py-2 [&_blockquote]:italic
            [&_hr]:my-8 [&_hr]:border-gray-200
            [&_table]:w-full [&_table]:text-sm [&_th]:border-b [&_th]:border-gray-200 [&_th]:p-2 [&_th]:text-left [&_td]:border-b [&_td]:border-gray-100 [&_td]:p-2"
          dangerouslySetInnerHTML={{ __html: page.body }}
        />
      </div>
    </div>
  );
}
