import Link from "next/link";

// Brand logo — gold wordmark on transparent (public/images/goldenlogo.png).
// Works on the dark navbar/footer and light auth screens alike.
export default function Logo({ light = false }: { light?: boolean }) {
  void light; // same gold mark on every surface
  return (
    <Link href="/" className="group inline-flex items-center" aria-label="ZaraSuno home">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/goldenlogo.png"
        alt="ZaraSuno"
        className="h-7 w-auto transition-transform group-hover:scale-105 sm:h-8"
      />
    </Link>
  );
}
