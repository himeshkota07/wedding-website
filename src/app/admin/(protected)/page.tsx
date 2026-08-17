import Link from "next/link";

const sections = [
  { href: "/admin/site-settings", label: "Site Content", blurb: "Home hero & Our Story" },
  { href: "/admin/events", label: "Events", blurb: "Names, dates, venues" },
  { href: "/admin/venues", label: "Venues", blurb: "Addresses, parking, accessibility" },
  { href: "/admin/family", label: "Family", blurb: "Bride & groom bios" },
  { href: "/admin/gallery", label: "Gallery", blurb: "Hide or delete photos" },
  { href: "/admin/faqs", label: "FAQs", blurb: "Static FAQ entries" },
  { href: "/admin/contacts", label: "Contacts", blurb: "Coordinators & WhatsApp link" },
];

export default function AdminDashboard() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-2xl font-semibold text-zinc-900">Dashboard</h1>
      <p className="mt-1 text-zinc-600">Pick a section to edit.</p>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {sections.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="rounded-lg border border-black/10 bg-white p-4 shadow-sm transition hover:border-accent hover:shadow-md"
          >
            <div className="font-medium text-zinc-900">{s.label}</div>
            <div className="text-sm text-zinc-500">{s.blurb}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
