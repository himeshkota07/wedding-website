"use client";

import { Printer } from "lucide-react";

export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex h-11 items-center gap-2 rounded-full bg-turmeric px-5 font-semibold text-teak transition-colors hover:bg-paper"
    >
      <Printer size={18} />
      Print or save as PDF
    </button>
  );
}
