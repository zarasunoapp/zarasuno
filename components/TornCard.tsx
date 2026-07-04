// A card with rough, torn-paper edges on all four sides (like the reference
// testimonial card). An SVG rough-rectangle sits behind the content.

function roughRect(seed: number) {
  let s = seed;
  const r = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  const W = 400, H = 560, J = 12, steps = 16;
  const pts: [number, number][] = [];
  for (let i = 0; i <= steps; i++) pts.push([(W / steps) * i, J * r()]);
  for (let i = 1; i <= steps; i++) pts.push([W - J * r(), (H / steps) * i]);
  for (let i = 1; i <= steps; i++) pts.push([W - (W / steps) * i, H - J * r()]);
  for (let i = 1; i < steps; i++) pts.push([J * r(), H - (H / steps) * i]);
  return "M" + pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" L") + " Z";
}

const PATH = roughRect(5);

export default function TornCard({
  children,
  fill = "#F2E9D5",
  className = "",
}: {
  children: React.ReactNode;
  fill?: string;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <svg
        viewBox="0 0 400 560"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full drop-shadow-xl"
        aria-hidden
      >
        <path d={PATH} fill={fill} />
      </svg>
      <div className="relative">{children}</div>
    </div>
  );
}
