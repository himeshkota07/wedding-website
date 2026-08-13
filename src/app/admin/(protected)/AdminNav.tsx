"use client";

import { useState } from "react";
import Link from "next/link";
import { signOut } from "../actions";

const sections = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/site-settings", label: "Site Content" },
  { href: "/admin/events", label: "Events" },
  { href: "/admin/venues", label: "Venues" },
  { href: "/admin/family", label: "Family" },
  { href: "/admin/gallery", label: "Gallery" },
  { href: "/admin/faqs", label: "FAQs" },
  { href: "/admin/contacts", label: "Contacts" },
];

export default function AdminNav({ userEmail }: { userEmail: string }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 border-b border-black/10 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <span className="text-lg font-semibold text-accent">Admin</span>

        <nav className="hidden items-center gap-6 md:flex">
          {sections.map((s) => (
            <Link key={s.href} href={s.href} className="text-sm font-medium text-zinc-600 hover:text-accent">
              {s.label}
            </Link>
          ))}
          <span className="text-sm text-zinc-400">{userEmail}</span>
          <form action={signOut}>
            <button type="submit" className="text-sm font-medium text-zinc-600 hover:text-accent">
              Sign out
            </button>
          </form>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="flex h-9 w-9 items-center justify-center rounded-md text-zinc-600 md:hidden"
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 border-t border-black/10 px-6 py-3 md:hidden">
          {sections.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              onClick={() => setOpen(false)}
              className="rounded-md px-2 py-2 text-sm font-medium text-zinc-600 hover:bg-accent-soft/40 hover:text-accent"
            >
              {s.label}
            </Link>
          ))}
          <div className="mt-2 flex items-center justify-between border-t border-black/10 px-2 pt-3">
            <span className="text-xs text-zinc-400">{userEmail}</span>
            <form action={signOut}>
              <button type="submit" className="text-sm font-medium text-zinc-600 hover:text-accent">
                Sign out
              </button>
            </form>
          </div>
        </nav>
      )}
    </header>
  );
}
