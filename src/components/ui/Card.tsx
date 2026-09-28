type CardProps = {
  as?: "div" | "article";
  /** Optional left-border accent color, e.g. an event's theme_color. */
  accent?: string;
  padding?: "sm" | "md" | "lg";
  className?: string;
  children: React.ReactNode;
};

const paddingClasses = {
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
};

export default function Card({ as: As = "div", accent, padding = "md", className = "", children }: CardProps) {
  return (
    <As
      className={`rounded-xl border border-hairline/70 bg-[#fffaf3] shadow-sm transition-shadow hover:shadow-md hover:shadow-accent/10 ${paddingClasses[padding]} ${className}`}
      style={accent ? { borderLeftColor: accent, borderLeftWidth: 4 } : undefined}
    >
      {children}
    </As>
  );
}
