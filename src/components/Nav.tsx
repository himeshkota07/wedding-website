"use client";

import { useState } from "react";
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
      <div className="bg-teak text-paper">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <Link
            href="/#top"
            onClick={() => setOpen(false)}
            className="font-script text-2xl text-turmeric transition-colors hover:text-paper"
          >
            T &amp; A
          </Link>

          <nav aria-label="Sections" className="hidden items-center gap-7 lg:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[0.95rem] font-medium text-paper/85 underline-offset-8 transition-colors hover:text-turmeric hover:underline"
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
            className="-mr-2 flex h-11 w-11 items-center justify-center text-paper lg:hidden"
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
              <ul className="grid grid-cols-2 gap-x-4 border-t border-paper/15 px-5 pb-5 pt-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className="block py-2.5 text-lg text-paper/90 transition-colors hover:text-turmeric"
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
