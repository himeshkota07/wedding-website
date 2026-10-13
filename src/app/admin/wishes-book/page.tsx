import type { Metadata } from "next";
import Image from "next/image";
import { requireAdmin } from "@/lib/admin-auth";
import { createAdminSupabase } from "@/lib/supabase-admin";
import { getHomeHero } from "@/lib/site-settings";
import { WISH_COLUMNS, LEGACY_WISH_COLUMNS, formatWishDate, isMissingColumnError, withWishDefaults, type Wish } from "@/lib/wishes";
import { Toran } from "@/components/ui/motifs";
import PrintButton from "./PrintButton";

export const metadata: Metadata = { title: "Pelli Pustakam" };

function dateSpan(wishes: Wish[]) {
  const first = formatWishDate(wishes[0].created_at);
  const last = formatWishDate(wishes[wishes.length - 1].created_at);
  return first === last ? `on ${first}` : `${first} to ${last}`;
}

/** One A5 sheet of the book. */
function Sheet({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={`book-sheet relative mx-auto flex flex-col overflow-hidden bg-paper text-ink ${className}`}>
      {children}
    </section>
  );
}

/**
 * The Pelli Pustakam: every visible wish bound into a keepsake book, one wish
 * to a page, for the couple to keep after the wedding. Opened from
 * /admin/wishes; the browser's Print > Save as PDF turns it into a file.
 * Outside the (protected) group so the admin nav doesn't print, which is why
 * it checks admin access itself.
 */
export default async function PelliPustakam() {
  await requireAdmin();

  const admin = createAdminSupabase();
  const read = (columns: string) =>
    admin.from("wishes").select(columns).eq("approved", true).order("created_at", { ascending: true });
  const [first, hero] = await Promise.all([read(WISH_COLUMNS), getHomeHero(admin)]);
  const result = isMissingColumnError(first.error) ? await read(LEGACY_WISH_COLUMNS) : first;
  const wishes = ((result.data ?? []) as unknown as Wish[]).map(withWishDefaults);
  const couple = `${hero.bride_name} & ${hero.groom_name}`;

  return (
    <div className="book min-h-full bg-teak py-10 print:bg-transparent print:py-0">
      <style>{`
        .book-sheet { width: 148mm; height: 210mm; }
        @media screen { .book-sheet + .book-sheet { margin-top: 2rem; } }
        @page { size: A5 portrait; margin: 0; }
        @media print {
          html, body { background: var(--paper) !important; }
          .book { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .book-sheet { break-after: page; margin: 0; }
          .book-sheet:last-child { break-after: auto; }
        }
      `}</style>

      <div className="mx-auto mb-8 flex max-w-[148mm] flex-wrap items-center justify-between gap-3 text-paper print:hidden">
        <p>
          {wishes.length} wish{wishes.length === 1 ? "" : "es"} · {wishes.length + 2} pages (A5)
        </p>
        <PrintButton />
      </div>

      {/* Cover */}
      <Sheet className="items-center justify-center text-center">
        <Image
          src="/invite/garland.jpg"
          alt=""
          width={283}
          height={470}
          className="absolute right-[8mm] top-0 h-[52mm] w-auto mix-blend-multiply"
        />
        <Image src="/invite/ganesha.jpg" alt="" width={100} height={115} className="h-[16mm] w-auto mix-blend-multiply" />
        <p className="mt-[10mm] font-display text-[13pt] uppercase tracking-[0.25em] text-ink-soft">Pelli Pustakam</p>
        <p className="mt-[3mm] font-display text-[14pt] text-ink-soft">Wishes for</p>
        <h1 className="mt-[2mm] px-[12mm] font-script text-[46pt] font-bold leading-tight text-ink">{couple}</h1>
        <p className="mt-[8mm] max-w-[100mm] text-[11pt] leading-relaxed text-ink-soft">
          {wishes.length > 0 ? `${wishes.length} wish${wishes.length === 1 ? "" : "es"} tied to their toran by family and friends, ${dateSpan(wishes)}.` : "No wishes have been tied yet."}
        </p>
        <Image
          src="/invite/pillar-foot.jpg"
          alt=""
          width={520}
          height={842}
          className="absolute bottom-0 left-0 h-[62mm] w-auto mix-blend-multiply"
        />
      </Sheet>

      {/* One wish to a page */}
      {wishes.map((wish, i) => (
        <Sheet key={wish.id}>
          <Toran />
          <div className="flex flex-1 flex-col px-[14mm] pb-[12mm] pt-[8mm]">
            <p className="font-display text-[10pt] uppercase tracking-[0.2em] text-ink-soft">
              Leaf {i + 1} of {wishes.length}
            </p>
            <div className="flex flex-1 flex-col justify-center">
              {wish.photo_url && (
                // eslint-disable-next-line @next/next/no-img-element -- guest photo on Cloudinary
                <img src={wish.photo_url} alt="" className="mb-[6mm] max-h-[62mm] w-full object-cover" />
              )}
              <p
                className={`whitespace-pre-line font-display leading-relaxed text-ink ${
                  wish.message.length > (wish.photo_url ? 200 : 380)
                    ? "text-[12pt]"
                    : wish.message.length > (wish.photo_url ? 90 : 180)
                      ? "text-[14pt]"
                      : "text-[17pt]"
                }`}
              >
                {wish.message}
              </p>
              <p className="mt-[8mm] font-script text-[30pt] font-bold leading-tight text-kumkum">{wish.name}</p>
              {wish.relation && <p className="text-[11pt] text-ink-soft">{wish.relation}</p>}
            </div>
            <p className="border-t border-brass/60 pt-[3mm] text-[9pt] text-ink-soft">{formatWishDate(wish.created_at)}</p>
          </div>
        </Sheet>
      ))}

      {/* Closing page */}
      <Sheet className="items-center justify-center bg-paper-deep text-center">
        <p className="font-script text-[38pt] font-bold text-kumkum">With love</p>
        <p className="mt-[4mm] font-display text-[13pt] text-ink-soft">to {couple}</p>
      </Sheet>
    </div>
  );
}
