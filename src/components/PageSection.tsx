export default function PageSection({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight text-accent">{title}</h1>
      {subtitle && <p className="mt-2 text-zinc-600">{subtitle}</p>}
      <div className="mt-8 space-y-4 text-zinc-700">{children}</div>
    </div>
  );
}
