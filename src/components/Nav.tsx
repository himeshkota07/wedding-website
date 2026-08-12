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
  return (
    <header className="border-b border-black/10 bg-white/80 backdrop-blur">
      <nav className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-6 py-4">
        <Link href="/" className="mr-auto text-lg font-semibold text-accent">
          Our Wedding
        </Link>
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-sm font-medium text-zinc-600 hover:text-accent"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
