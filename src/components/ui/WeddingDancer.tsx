type WeddingDancerProps = {
  variant: "bride" | "groom";
  flip?: boolean;
  size?: number;
  opacity?: number;
  className?: string;
};

const SKIN = "#c9895f";
const DARK = "#3a1420";

/**
 * A simplified, original flat-vector illustration of a dancing bride/groom
 * pair in traditional Indian wedding attire (lehenga + dupatta / turban +
 * kurta), in the site's own colors. Hand-drawn geometric shapes -- not an
 * attempt to reproduce the fine linework of a professional illustration,
 * which is beyond what can be hand-coded here.
 */
export default function WeddingDancer({ variant, flip = false, size = 100, opacity = 1, className = "" }: WeddingDancerProps) {
  return (
    <svg
      viewBox="0 0 100 150"
      width={(size * 100) / 150}
      height={size}
      className={className}
      style={{ opacity, transform: flip ? "scaleX(-1)" : undefined }}
      aria-hidden
    >
      {variant === "bride" ? <Bride /> : <Groom />}
    </svg>
  );
}

function Bride() {
  return (
    <g>
      {/* dupatta veil, draped over the head and flowing to one side */}
      <path
        d="M38,16 C26,13 16,29 19,51 C20,65 27,73 36,69 C30,54 32,31 43,19 Z"
        fill="var(--accent-soft)"
        stroke="var(--gold)"
        strokeWidth="1"
      />
      {/* raised, bangled arm */}
      <path d="M40,40 L27,31 L19,19" stroke={SKIN} strokeWidth="4" fill="none" strokeLinecap="round" />
      <circle cx="23" cy="25" r="1.6" fill="var(--gold)" />
      <circle cx="26" cy="30" r="1.6" fill="var(--gold)" />
      {/* resting arm */}
      <path d="M60,41 L66,54" stroke={SKIN} strokeWidth="4" fill="none" strokeLinecap="round" />
      {/* lehenga skirt */}
      <path
        d="M43,56 C25,70 15,102 12,140 L88,140 C85,102 75,70 57,56 Z"
        fill="var(--accent)"
      />
      <path d="M15,127 Q50,138 85,127" stroke="var(--gold)" strokeWidth="2" fill="none" opacity="0.85" />
      <path d="M46,58 Q39,100 34,138" stroke="var(--gold-soft)" strokeWidth="1" fill="none" opacity="0.7" />
      <path d="M54,58 Q61,100 66,138" stroke="var(--gold-soft)" strokeWidth="1" fill="none" opacity="0.7" />
      {/* choli bodice */}
      <path d="M40,38 L60,38 L57,56 L43,56 Z" fill="var(--gold)" />
      <circle cx="50" cy="41" r="1.2" fill="var(--accent-deep)" />
      {/* head */}
      <circle cx="50" cy="26" r="10" fill={SKIN} />
      <path d="M42,20 Q50,14 58,20" stroke={DARK} strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx="50" cy="30" r="1" fill="var(--accent-deep)" />
      {/* feet */}
      <ellipse cx="37" cy="143" rx="4" ry="2" fill={DARK} />
      <ellipse cx="63" cy="143" rx="4" ry="2" fill={DARK} />
    </g>
  );
}

function Groom() {
  return (
    <g>
      {/* legs / dhoti pants */}
      <path d="M43,68 C38,94 35,124 37,148 L47,148 C48,124 47,94 50,68 Z" fill="var(--gold-soft)" />
      <path d="M57,68 C62,94 65,124 63,148 L53,148 C52,124 53,94 50,68 Z" fill="var(--gold-soft)" />
      <ellipse cx="42" cy="149" rx="4" ry="2" fill={DARK} />
      <ellipse cx="58" cy="149" rx="4" ry="2" fill={DARK} />
      {/* arm on hip */}
      <path d="M40,46 L33,54 L36,63" stroke={SKIN} strokeWidth="4" fill="none" strokeLinecap="round" />
      {/* raised/bent arm */}
      <path d="M60,46 L68,53 L64,64" stroke={SKIN} strokeWidth="4" fill="none" strokeLinecap="round" />
      {/* kurta top */}
      <path d="M40,42 L60,42 L56,68 L44,68 Z" fill="var(--accent-deep)" />
      <path d="M44,66 L56,66" stroke="var(--gold)" strokeWidth="1.5" />
      {/* head */}
      <circle cx="50" cy="34" r="9" fill={SKIN} />
      <path d="M45,38 Q50,40.5 55,38" stroke={DARK} strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* turban */}
      <ellipse cx="50" cy="21" rx="14" ry="12" fill="var(--gold)" />
      <path d="M38,21 Q50,29 62,21" stroke="var(--accent-deep)" strokeWidth="1.2" fill="none" opacity="0.6" />
      <path d="M38,16 Q50,23 62,16" stroke="var(--accent-deep)" strokeWidth="1.2" fill="none" opacity="0.6" />
      <circle cx="50" cy="15" r="1.8" fill="var(--accent)" />
      <path d="M57,10 Q63,2 59,-3 Q55,2 57,10 Z" fill="var(--accent)" />
    </g>
  );
}
