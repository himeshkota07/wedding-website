import Link from "next/link";
import { createAdminSupabase } from "@/lib/supabase-admin";
import { resyncKnowledgeBase } from "./actions";

const sections = [
  { href: "/admin/site-settings", label: "Site Content", blurb: "Home hero & Our Story" },
  { href: "/admin/events", label: "Events", blurb: "Names, dates, venues" },
  { href: "/admin/venues", label: "Venues", blurb: "Addresses, parking, accessibility" },
  { href: "/admin/family", label: "Family", blurb: "Bride & groom bios" },
  { href: "/admin/gallery", label: "Gallery", blurb: "Hide or delete photos" },
  { href: "/admin/faqs", label: "FAQs", blurb: "Static FAQ entries" },
  { href: "/admin/contacts", label: "Contacts", blurb: "Coordinators & WhatsApp link" },
];

export default async function AdminDashboard() {
  const admin = createAdminSupabase();
  const { count } = await admin.from("content_chunks").select("id", { count: "exact", head: true });

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

      <h2 className="mt-10 text-lg font-semibold text-zinc-900">Chatbot Knowledge Base</h2>
      <div className="mt-3 rounded-lg border border-black/10 bg-white p-4 shadow-sm">
        <p className="text-sm text-zinc-600">
          {count ?? 0} indexed chunk{count === 1 ? "" : "s"}. This resyncs automatically after every save elsewhere on
          this dashboard — use this only if something looks out of date.
        </p>
        <form action={resyncKnowledgeBase} className="mt-3">
          <button type="submit" className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-white">
            Resync now
          </button>
        </form>
      </div>
    </div>
  );
}
