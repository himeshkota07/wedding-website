"use client";

import { useId, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Plus } from "lucide-react";

type AccordionItem = { id: string; question: string; answer: string };

/** Question rows ruled like a ledger, set on the leaf-green field. */
export default function Accordion({ items }: { items: AccordionItem[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();
  const baseId = useId();

  return (
    <div className="border-b border-paper/25">
      {items.map((item) => {
        const open = openId === item.id;
        const panelId = `${baseId}-${item.id}`;
        return (
          <div key={item.id} className="border-t border-paper/25">
            <button
              type="button"
              onClick={() => setOpenId(open ? null : item.id)}
              aria-expanded={open}
              aria-controls={panelId}
              className="flex min-h-14 w-full items-center justify-between gap-4 py-4 text-left font-display text-xl text-paper transition-colors hover:text-turmeric"
            >
              {item.question}
              <motion.span
                animate={{ rotate: open ? 45 : 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="shrink-0 text-turmeric"
              >
                <Plus size={22} />
              </motion.span>
            </button>
            <motion.div
              id={panelId}
              initial={false}
              animate={{ gridTemplateRows: open ? "1fr" : "0fr" }}
              transition={{ duration: reduceMotion ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="grid"
            >
              <div className="overflow-hidden">
                <p className="max-w-[60ch] pb-5 text-lg text-paper/85">{item.answer}</p>
              </div>
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}
