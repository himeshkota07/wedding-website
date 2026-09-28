type PuppetSilhouetteProps = {
  /** Mirror the pose for the opposite side, so only one shape is hand-drawn. */
  flip?: boolean;
  size?: number;
  opacity?: number;
  className?: string;
};

/**
 * A simple kathputli-style marionette silhouette: round head, flared
 * bell-shaped skirt (no legs, authentic to the traditional puppet form),
 * raised dancing arms, and thin strings running up to a control bar --
 * that last detail is what reads as "puppet" rather than a generic
 * dancing figure. Stroke-only line art, matching Monogram/Divider.
 */
export default function PuppetSilhouette({ flip = false, size = 80, opacity = 1, className = "" }: PuppetSilhouetteProps) {
  return (
    <svg
      viewBox="0 0 60 100"
      width={size * 0.6}
      height={size}
      className={className}
      style={{ opacity, transform: flip ? "scaleX(-1)" : undefined }}
      aria-hidden
    >
      {/* control bar + strings, running down to the raised hands */}
      <line x1="20" y1="2" x2="40" y2="2" fill="none" stroke="var(--accent-deep)" strokeWidth="1" />
      <line x1="30" y1="2" x2="30" y2="13" fill="none" stroke="var(--accent-deep)" strokeWidth="1" />
      <line x1="20" y1="2" x2="9" y2="8" fill="none" stroke="var(--accent-deep)" strokeWidth="1" />
      <line x1="40" y1="2" x2="51" y2="8" fill="none" stroke="var(--accent-deep)" strokeWidth="1" />

      {/* head */}
      <circle cx="30" cy="20" r="7" fill="none" stroke="var(--accent-deep)" strokeWidth="1" />

      {/* raised, bent dancing arms */}
      <path d="M22,28 L14,18 L9,8" fill="none" stroke="var(--accent-deep)" strokeWidth="1" />
      <path d="M38,28 L46,18 L51,8" fill="none" stroke="var(--accent-deep)" strokeWidth="1" />
      <circle cx="9" cy="8" r="1.5" fill="none" stroke="var(--accent-deep)" strokeWidth="1" />
      <circle cx="51" cy="8" r="1.5" fill="none" stroke="var(--accent-deep)" strokeWidth="1" />

      {/* flared skirt body */}
      <path d="M22,28 L14,85 Q30,92 46,85 L38,28 Z" fill="none" stroke="var(--accent-deep)" strokeWidth="1" />
      <line x1="19" y1="55" x2="41" y2="55" fill="none" stroke="var(--accent-deep)" strokeWidth="1" />
    </svg>
  );
}
