type MonogramProps = {
  initials?: string;
  /** Fixed size in px. Defaults to a responsive 96px/112px (mobile/desktop). */
  size?: number;
  className?: string;
};

/**
 * A simple line-art emblem: a hairline ring with two small flourish ticks,
 * and the couple's initials set on top in the script font. Deliberately
 * geometric/hand-codeable (not a painted illustration).
 */
export default function Monogram({ initials = "T & A", size, className = "" }: MonogramProps) {
  return (
    <div
      className={`relative inline-flex items-center justify-center ${size ? "" : "h-24 w-24 sm:h-28 sm:w-28"} ${className}`}
      style={size ? { width: size, height: size } : undefined}
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden>
        <circle cx="50" cy="50" r="42" fill="none" stroke="var(--accent-deep)" strokeWidth="1" />
        <line x1="50" y1="4" x2="50" y2="12" stroke="var(--accent-deep)" strokeWidth="1" />
        <line x1="50" y1="88" x2="50" y2="96" stroke="var(--accent-deep)" strokeWidth="1" />
      </svg>
      <span
        className={`font-script italic text-accent-deep ${size ? "" : "text-2xl sm:text-3xl"}`}
        style={size ? { fontSize: size * 0.28 } : undefined}
      >
        {initials}
      </span>
    </div>
  );
}
