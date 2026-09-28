import { useId } from "react";

/**
 * A thoranam: mango leaves and marigold heads strung across a doorway. Hung
 * at the top of every section so walking down the page means stepping
 * through one decorated entrance after another. Flat shapes only; depth comes
 * from overlap, never from shading.
 */
export function Toran({ className = "", tone = "leaf" }: { className?: string; tone?: "leaf" | "paper" }) {
  const id = useId();
  const leafA = tone === "paper" ? "var(--paper)" : "var(--leaf)";
  const leafB = tone === "paper" ? "var(--paper-deep)" : "var(--leaf-soft)";
  return (
    <svg aria-hidden className={`block h-11 w-full ${className}`} preserveAspectRatio="none">
      <defs>
        <pattern id={id} width="96" height="44" patternUnits="userSpaceOnUse">
          <path d="M0,3.5 Q24,6 48,3.5 T96,3.5" fill="none" stroke="var(--brass)" strokeWidth="1.5" />
          <path d="M12,4 C5,12 6,27 12,40 C18,27 19,12 12,4 Z" fill={leafA} />
          <path d="M12,7 L12,36" stroke={leafB} strokeWidth="0.8" />
          <circle cx="30" cy="10" r="5.5" fill="var(--marigold)" />
          <circle cx="30" cy="10" r="3.4" fill="var(--turmeric)" />
          <circle cx="30" cy="10" r="1.4" fill="var(--turmeric-deep)" />
          <path d="M60,4 C53,12 54,27 60,40 C66,27 67,12 60,4 Z" fill={leafB} />
          <path d="M60,7 L60,36" stroke={leafA} strokeWidth="0.8" />
          <circle cx="78" cy="10" r="5.5" fill="var(--kumkum)" />
          <circle cx="78" cy="10" r="3.4" fill="var(--marigold)" />
          <circle cx="78" cy="10" r="1.4" fill="var(--turmeric)" />
        </pattern>
      </defs>
      <rect width="100%" height="44" fill={`url(#${id})`} />
    </svg>
  );
}

/** Carved scallops hanging beneath the teak canopy beam. */
export function BeamTrim({ className = "" }: { className?: string }) {
  const id = useId();
  return (
    <svg aria-hidden className={`block h-3 w-full ${className}`} preserveAspectRatio="none">
      <defs>
        <pattern id={id} width="18" height="12" patternUnits="userSpaceOnUse">
          <path d="M0,0 H18 V3 Q9,13 0,3 Z" fill="var(--teak)" />
          <circle cx="9" cy="6.5" r="1.3" fill="var(--brass)" />
        </pattern>
      </defs>
      <rect width="100%" height="1.5" fill="var(--brass)" />
      <rect y="1.5" width="100%" height="10.5" fill={`url(#${id})`} />
    </svg>
  );
}

/** One marigold head: overlapping flat discs, as a garland-maker would build it. */
export function Marigold({ size = 24, tone = "orange" }: { size?: number; tone?: "orange" | "yellow" | "red" }) {
  const [outer, mid, core] =
    tone === "yellow"
      ? ["var(--turmeric)", "#f7cf57", "var(--turmeric-deep)"]
      : tone === "red"
        ? ["var(--kumkum)", "var(--marigold)", "var(--turmeric)"]
        : ["var(--marigold)", "var(--turmeric)", "var(--turmeric-deep)"];
  return (
    <svg aria-hidden width={size} height={size} viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="11" fill={outer} />
      <circle cx="12" cy="12" r="7" fill={mid} />
      <circle cx="12" cy="12" r="3" fill={core} />
    </svg>
  );
}
