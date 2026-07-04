// A single, smooth, professional wave divider. It is absolutely positioned just
// above its parent section (which must be `relative`), so it decorates the
// transition WITHOUT adding any height — keeping section padding symmetric.
// `fill` should be the parent section's own background colour.

export default function Curve({ fill, className = "" }: { fill: string; className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute inset-x-0 top-0 z-[1] -translate-y-[99%] ${className}`}
      style={{ lineHeight: 0 }}
      aria-hidden
    >
      <svg viewBox="0 0 1440 48" preserveAspectRatio="none" className="block h-8 w-full sm:h-11">
        <path d="M0,48 L0,26 C 320,52 560,6 760,24 C 980,40 1180,8 1440,28 L1440,48 Z" fill={fill} />
      </svg>
    </div>
  );
}
