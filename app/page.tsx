import {
  getSessionUser, getHomeSections, getAllBooks, getCategories, getSubcategories, getFaqs,
} from "@/lib/queries";
import HomeClient from "@/components/HomeClient";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getSessionUser();
  const signedIn = !!user;

  const [sections, allBooks, categories, subcategories, faqs] = await Promise.all([
    getHomeSections(signedIn),
    getAllBooks(),
    getCategories(),
    getSubcategories(),
    getFaqs(),
  ]);

  const bookOfDay = allBooks.find((b) => b.is_book_of_day) ?? allBooks[0] ?? null;

  return (
    <HomeClient
      signedIn={signedIn}
      sections={sections}
      allBooks={allBooks}
      categories={categories}
      subcategories={subcategories}
      bookOfDay={bookOfDay}
      faqs={faqs}
    />
  );
}
