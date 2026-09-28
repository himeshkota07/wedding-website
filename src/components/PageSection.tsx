import Divider from "@/components/ui/Divider";

export default function PageSection({
  id,
  title,
  subtitle,
  divider = true,
  children,
}: {
  id?: string;
  title: string;
  subtitle?: string;
  /** Show the decorative hairline divider above the section. */
  divider?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20">
      {divider && <Divider className="pt-12" />}
      <div className="mx-auto w-full max-w-3xl px-6 py-12">
        <h2 className="font-display text-3xl font-semibold tracking-tight text-ink">{title}</h2>
        {subtitle && <p className="mt-2 text-foreground/70">{subtitle}</p>}
        <div className="mt-8 space-y-4 text-foreground/80">{children}</div>
      </div>
    </section>
  );
}
