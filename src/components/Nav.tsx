"use client";

import { useState } from "react";
import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/our-story", label: "Our Story" },
  { href: "/events", label: "Events" },
  { href: "/venue", label: "Venue" },
  { href: "/family", label: "Family" },
  { href: "/gallery", label: "Gallery" },
  { href: "/faq", label: "FAQ & Chat" },
  { href: "/contact", label: "Contact" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 border-b border-black/10 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold text-accent" onClick={() => setOpen(false)}>
          Our Wedding
        </Link>

        <nav className="hidden items-center gap-6 sm:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm font-medium text-zinc-600 hover:text-accent">
              {link.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="flex h-9 w-9 items-center justify-center rounded-md text-zinc-600 sm:hidden"
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 border-t border-black/10 px-6 py-3 sm:hidden">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-md px-2 py-2 text-sm font-medium text-zinc-600 hover:bg-accent-soft/40 hover:text-accent"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
