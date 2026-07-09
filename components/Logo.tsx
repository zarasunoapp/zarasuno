import Link from "next/link";

// Brand logo (from public/images). On dark surfaces we sit the horizontal mark
// on a soft light chip so the wordmark stays readable and matches the nav pills.
export default function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="group inline-flex items-center" aria-label="ZaraSuno home">
      <span
        className={
          light
            ? "rounded-xl bg-white/95 px-2.5 py-1.5 shadow-soft ring-1 ring-black/5 transition-transform group-hover:scale-105"
            : "transition-transform group-hover:scale-105"
        }
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/logo-light.png" alt="ZaraSuno" className="h-7 w-auto sm:h-8" />
      </span>
    </Link>
  );
}
