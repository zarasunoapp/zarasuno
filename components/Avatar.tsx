"use client";

import { cn } from "@/lib/utils";

// Name-based avatar — shows initials on a deterministic branded gradient.
// No photo, works for any name/gender.
const GRADIENTS = [
  "linear-gradient(135deg,#0B5D4B,#12876B)",
  "linear-gradient(135deg,#12876B,#D9A94C)",
  "linear-gradient(135deg,#1E6F5C,#0B5D4B)",
  "linear-gradient(135deg,#C98A3B,#E0B84C)",
  "linear-gradient(135deg,#2F6B4F,#8FBF9F)",
  "linear-gradient(135deg,#0B5D4B,#3E9C7E)",
];

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function hash(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export default function Avatar({
  name,
  size = 88,
  className,
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const label = name?.trim() || "Listener";
  const gradient = GRADIENTS[hash(label) % GRADIENTS.length];
  return (
    <div
      aria-label={label}
      className={cn("grid place-items-center rounded-full font-serif font-bold uppercase leading-none text-white", className)}
      style={{ width: size, height: size, fontSize: size * 0.38, background: gradient }}
    >
      {initialsOf(label)}
    </div>
  );
}
