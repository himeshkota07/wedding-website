import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { signOut } from "../actions";

const sections = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/events", label: "Events" },
  { href: "/admin/venues", label: "Venues" },
  { href: "/admin/family", label: "Family" },
  { href: "/admin/faqs", label: "FAQs" },
  { href: "/admin/contacts", label: "Contacts" },
];

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-b border-black/10 bg-white">
        <nav className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-6 py-4">
          <span className="mr-auto text-lg font-semibold text-accent">Admin</span>
          {sections.map((s) => (
            <Link key={s.href} href={s.href} className="text-sm font-medium text-zinc-600 hover:text-accent">
              {s.label}
            </Link>
          ))}
          <span className="text-sm text-zinc-400">{user.email}</span>
          <form action={signOut}>
            <button type="submit" className="text-sm font-medium text-zinc-600 hover:text-accent">
              Sign out
            </button>
          </form>
        </nav>
      </header>
      <main className="flex-1 bg-zinc-50">{children}</main>
    </div>
  );
}
