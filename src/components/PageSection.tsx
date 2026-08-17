export default function PageSection({
  id,
  title,
  subtitle,
  tint = false,
  children,
}: {
  id?: string;
  title: string;
  subtitle?: string;
  tint?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={`scroll-mt-20 ${tint ? "bg-accent-soft/30" : "bg-white"}`}>
      <div className="mx-auto w-full max-w-3xl px-6 py-16">
        <h2 className="text-3xl font-semibold tracking-tight text-accent">{title}</h2>
        {subtitle && <p className="mt-2 text-zinc-600">{subtitle}</p>}
        <div className="mt-8 space-y-4 text-zinc-700">{children}</div>
      </div>
    </section>
  );
}
