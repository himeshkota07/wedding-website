import { Toran } from "@/components/ui/motifs";

type Tone = "paper" | "deep" | "turmeric" | "leaf" | "teak";

const toneClasses: Record<Tone, { section: string; intro: string }> = {
  paper: { section: "bg-paper text-ink", intro: "text-ink-soft" },
  deep: { section: "bg-paper-deep text-ink", intro: "text-ink-soft" },
  turmeric: { section: "bg-turmeric text-ink", intro: "text-teak-soft" },
  leaf: { section: "bg-leaf text-paper", intro: "text-paper/85" },
  teak: { section: "bg-teak text-paper", intro: "text-paper/80" },
};

/**
 * One bay of the mandapam: a toran strung across the top, a heading, and the
 * bay's contents on its own field of colour.
 */
export default function PageSection({
  id,
  title,
  subtitle,
  tone = "paper",
  children,
}: {
  id?: string;
  title: string;
  subtitle?: string;
  tone?: Tone;
  children: React.ReactNode;
}) {
  const t = toneClasses[tone];
  return (
    <section id={id} className={`scroll-mt-16 ${t.section}`}>
      <Toran tone={tone === "leaf" ? "paper" : "leaf"} />
      <div className="mx-auto w-full max-w-5xl px-5 pb-20 pt-10 sm:px-8 sm:pb-28 sm:pt-14">
        <h2 className="font-display text-4xl leading-tight sm:text-5xl">{title}</h2>
        {subtitle && <p className={`mt-3 max-w-2xl text-lg ${t.intro}`}>{subtitle}</p>}
        <div className="mt-10 sm:mt-12">{children}</div>
      </div>
    </section>
  );
}
