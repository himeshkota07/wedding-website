type DividerProps = {
  variant?: "flourish" | "plain";
  className?: string;
};

/**
 * How sections are visually separated without alternating background
 * tints (a look that was explicitly rejected for this site).
 */
export default function Divider({ variant = "flourish", className = "" }: DividerProps) {
  if (variant === "plain") {
    return <div className={`h-px bg-hairline/60 ${className}`} aria-hidden />;
  }

  return (
    <div className={`flex items-center justify-center gap-3 ${className}`} aria-hidden>
      <span className="h-px w-16 bg-hairline/60 sm:w-24" />
      <svg width="10" height="10" viewBox="0 0 10 10" className="shrink-0">
        <path d="M5 0 L10 5 L5 10 L0 5 Z" fill="none" stroke="var(--hairline)" strokeWidth="1" />
      </svg>
      <span className="h-px w-16 bg-hairline/60 sm:w-24" />
    </div>
  );
}
