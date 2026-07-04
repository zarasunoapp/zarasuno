import Link from "next/link";
import { BookX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-6 py-28 text-center">
      <span className="grid h-16 w-16 place-items-center rounded-2xl bg-brand-50 text-brand-600">
        <BookX className="h-7 w-7" />
      </span>
      <h1 className="mt-6 font-serif text-3xl font-semibold text-gray-900">Page not found</h1>
      <p className="mt-2 text-gray-500">The page you&apos;re looking for doesn&apos;t exist.</p>
      <Link href="/" className="mt-6 rounded-full bg-brand px-7 py-3 font-semibold text-white hover:bg-brand-600">
        Back home
      </Link>
    </div>
  );
}
