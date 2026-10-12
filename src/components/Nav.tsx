"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Menu, X } from "lucide-react";
import { BeamTrim } from "@/components/ui/motifs";

const links = [
  { href: "/#top", label: "Home" },
  { href: "/#our-story", label: "Our Story" },
  { href: "/#events", label: "Events" },
  { href: "/#venue", label: "Venue" },
  { href: "/#family", label: "Family" },
  { href: "/#gallery", label: "Gallery" },
  { href: "/#faq", label: "FAQ & Chat" },
  { href: "/#contact", label: "Contact" },
];

/** The mandapam's carved teak canopy beam, carrying the navigation. */
export default function Nav() {
  const [open, setOpen] = useState(false);
  const reduceMotion = useReducedMotion();

  return (
    <header className="sticky top-0 z-30">
      {/* Haldi yellow, from the bride's dress in the opening illustration. Text on it is ink (9.6:1);
          paper/white would be unreadable (1.6:1), and hovers use kumkum-deep since plain kumkum is under 4.5:1. */}
      <div className="bg-haldi text-ink">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          {/* The couple's wax seal, hung from the beam: centred on the bar's bottom edge, half on the bar and
              half over the page. The link keeps the seal's width in the row; the seal itself is positioned
              absolutely so it can overhang. id="site-logo" is where the intro's seal flies to. */}
          <Link
            href="/#top"
            onClick={() => setOpen(false)}
            aria-label="Tarunya & Ashish, back to top"
            className="relative h-full w-[4.75rem] shrink-0"
          >
            <Image
              id="site-logo"
              src="/theme/logo-seal.png"
              alt=""
              width={508}
              height={640}
              preload
              sizes="80px"
              className="absolute left-0 top-4 z-10 h-24 w-auto drop-shadow-[0_4px_6px_rgb(0_0_0/0.35)]"
            />
          </Link>

          <nav aria-label="Sections" className="hidden items-center gap-7 lg:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[0.95rem] font-medium text-ink underline-offset-8 transition-colors hover:text-kumkum-deep hover:underline"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="-mr-2 flex h-11 w-11 items-center justify-center text-ink lg:hidden"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <AnimatePresence initial={false}>
          {open && (
            <motion.nav
              key="mobile-menu"
              aria-label="Sections"
              initial={reduceMotion ? { height: "auto" } : { height: 0 }}
              animate={{ height: "auto" }}
              exit={reduceMotion ? { height: "auto" } : { height: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden lg:hidden"
            >
              <ul className="grid grid-cols-2 gap-x-4 border-t border-ink/15 px-5 pb-5 pt-14">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className="block py-2.5 text-lg text-ink transition-colors hover:text-kumkum-deep"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
      <BeamTrim />
    </header>
  );
}
