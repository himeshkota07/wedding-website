"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ChevronDown } from "lucide-react";

type AccordionItem = { id: string; question: string; answer: string };

export default function Accordion({ items }: { items: AccordionItem[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();

  return (
    <div className="divide-y divide-hairline/50 rounded-xl border border-hairline/60 bg-white shadow-sm">
      {items.map((item) => {
        const open = openId === item.id;
        return (
          <div key={item.id} className="p-4">
            <button
              type="button"
              onClick={() => setOpenId(open ? null : item.id)}
              aria-expanded={open}
              className="flex w-full items-center justify-between gap-3 text-left font-medium text-ink"
            >
              {item.question}
              <motion.span
                animate={{ rotate: open ? 180 : 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.2 }}
                className="shrink-0 text-accent-deep"
              >
                <ChevronDown size={18} />
              </motion.span>
            </button>
            <motion.div
              initial={false}
              animate={{ gridTemplateRows: open ? "1fr" : "0fr" }}
              transition={{ duration: reduceMotion ? 0 : 0.25, ease: "easeInOut" }}
              className="grid"
            >
              <div className="overflow-hidden">
                <p className="mt-2 text-foreground/70">{item.answer}</p>
              </div>
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}
