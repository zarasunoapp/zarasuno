import Link from "next/link";
import { Headphones } from "lucide-react";

export default function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2 group">
      <span
        className={`grid h-9 w-9 place-items-center rounded-xl shadow-soft transition-transform group-hover:scale-105 ${
          light ? "bg-gold-400 text-brand-900" : "bg-brand text-white"
        }`}
      >
        <Headphones className="h-5 w-5" strokeWidth={2.2} />
      </span>
      <span
        className={`font-serif text-xl font-semibold tracking-tight ${
          light ? "text-white" : "text-brand-700"
        }`}
      >
        Zara<span className="text-gold-500">Suno</span>
      </span>
    </Link>
  );
}
