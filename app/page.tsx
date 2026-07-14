import {
  getSessionUser, getHomeSections, getAllBooks, getCategories, getSubcategories, getFaqs, getFeaturedBooks, getTestimonials,
} from "@/lib/queries";
import HomeClient from "@/components/HomeClient";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getSessionUser();
  const signedIn = !!user;

  const [sections, allBooks, categories, subcategories, faqs, featuredBooks, testimonials] = await Promise.all([
    getHomeSections(signedIn),
    getAllBooks(),
    getCategories(),
    getSubcategories(),
    getFaqs(),
    getFeaturedBooks(),
    getTestimonials(),
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
    />
  );
}
