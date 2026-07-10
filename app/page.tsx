import {
  getSessionUser, getHomeSections, getAllBooks, getCategories, getSubcategories, getFaqs, getFeaturedBooks,
} from "@/lib/queries";
import HomeClient from "@/components/HomeClient";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getSessionUser();
  const signedIn = !!user;

  const [sections, allBooks, categories, subcategories, faqs, featuredBooks] = await Promise.all([
    getHomeSections(signedIn),
    getAllBooks(),
    getCategories(),
    getSubcategories(),
    getFaqs(),
    getFeaturedBooks(),
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
    />
  );
}
