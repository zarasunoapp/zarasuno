import Link from "next/link";
import { Lock } from "lucide-react";

export default function SignInPrompt({ title, message }: { title: string; message: string }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-6 py-24 text-center">
      <span className="grid h-16 w-16 place-items-center rounded-2xl bg-brand-50 text-brand-600">
        <Lock className="h-7 w-7" />
      </span>
      <h1 className="mt-6 font-serif text-2xl font-semibold text-gray-900">{title}</h1>
      <p className="mt-2 text-gray-500">{message}</p>
      <Link
        href="/login"
        className="mt-6 rounded-full bg-brand px-7 py-3 font-semibold text-white transition hover:bg-brand-600"
      >
        Sign in to continue
      </Link>
    </div>
  );
}
