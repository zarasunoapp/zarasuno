import {
  getSessionUser, getHomeSections, getAllBooks, getCategories, getSubcategories, getFaqs, getFeaturedBooks, getTestimonials, getPopularAuthors, getHeroFeature,
} from "@/lib/queries";
import { createClient } from "@/lib/supabase/server";
import HomeClient from "@/components/HomeClient";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getSessionUser();
  const signedIn = !!user;

  // the user's picked categories / languages drive Recommended + language carousels
  let selectedCats: string[] = [];
  let selectedLangs: string[] = [];
  if (user) {
    const db = createClient();
    const [{ data: uc }, { data: ul }] = await Promise.all([
      db.from("user_categories").select("category_id").eq("user_id", user.id),
      db.from("user_languages").select("language_code").eq("user_id", user.id),
    ]);
    selectedCats = (uc ?? []).map((r: any) => r.category_id);
    selectedLangs = (ul ?? []).map((r: any) => r.language_code);
  }

  const [sections, allBooks, categories, subcategories, faqs, featuredBooks, testimonials, popularAuthors, heroFeature] = await Promise.all([
    getHomeSections(signedIn, selectedCats, selectedLangs),
    getAllBooks(),
    getCategories(),
    getSubcategories(),
    getFaqs(),
    getFeaturedBooks(),
    getTestimonials(),
    getPopularAuthors(),
    getHeroFeature(),
  ]);

  return (
    <HomeClient
      signedIn={signedIn}
      sections={sections}
      allBooks={allBooks}
      categories={categories}
      subcategories={subcategories}
      faqs={faqs}
      featuredBooks={featuredBooks}
      testimonials={testimonials}
      popularAuthors={popularAuthors}
      heroFeature={heroFeature}
    />
  );
}
