import Link from "next/link";
import { BookOpen } from "lucide-react";
import { createAdminSupabase } from "@/lib/supabase-admin";
import { formatWishDate } from "@/lib/wishes";
import { SelectAllCheckbox } from "../gallery/SelectAllCheckbox";
import { showSelectedWishes, hideSelectedWishes, deleteSelectedWishes } from "./actions";

export default async function AdminWishesPage() {
  // Service-role client: the public policy only returns visible wishes, and
  // hidden ones must stay listed here so they can be shown again.
  const admin = createAdminSupabase();
  const { data: wishes, error } = await admin
    .from("wishes")
    .select("id, name, relation, message, approved, created_at")
    .order("created_at", { ascending: false });

  const visible = wishes?.filter((w) => w.approved).length ?? 0;

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Wishes</h1>
          <p className="mt-1 text-zinc-600">
            Guests&apos; wishes go live on the Wishing Toran immediately. Select wishes to hide, show, or delete them.
          </p>
        </div>
        <Link
          href="/admin/wishes-book"
          target="_blank"
          className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white"
        >
          <BookOpen size={16} />
          Pelli Pustakam ({visible})
        </Link>
      </div>
      <p className="mt-2 text-sm text-zinc-500">
        The Pelli Pustakam opens the keepsake book of every visible wish. Use your browser&apos;s Print and choose
        &ldquo;Save as PDF&rdquo; to download it.
      </p>

      {error ? (
        <p className="mt-6 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          Couldn&apos;t load wishes: {error.message}. If the table is missing, run
          <code className="mx-1">supabase/migrations/0006_wishes.sql</code>in the Supabase SQL editor.
        </p>
      ) : !wishes?.length ? (
        <p className="mt-6 text-sm text-zinc-500">No wishes yet.</p>
      ) : (
        <form action={hideSelectedWishes}>
          <div className="sticky top-0 z-10 mt-6 flex flex-wrap items-center gap-3 rounded-lg border border-black/10 bg-white p-3 shadow-sm">
            <SelectAllCheckbox />
            <button type="submit" formAction={hideSelectedWishes} className="rounded-md border border-black/20 px-3 py-1.5 text-sm font-medium text-zinc-600">
              Hide selected
            </button>
            <button type="submit" formAction={showSelectedWishes} className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-white">
              Show selected
            </button>
            <button type="submit" formAction={deleteSelectedWishes} className="rounded-md border border-red-300 px-3 py-1.5 text-sm font-medium text-red-600">
              Delete selected
            </button>
          </div>

          <ul className="mt-4 space-y-3">
            {wishes.map((wish) => (
              <li
                key={wish.id}
                className={`flex gap-3 rounded-lg border border-black/10 bg-white p-4 ${wish.approved ? "" : "opacity-50"}`}
              >
                <input type="checkbox" name="ids" value={wish.id} className="mt-1 h-5 w-5 shrink-0 accent-[var(--color-accent)]" />
                <div className="min-w-0">
                  <p className="whitespace-pre-line text-zinc-800">{wish.message}</p>
                  <p className="mt-2 text-sm text-zinc-500">
                    <span className="font-medium text-zinc-700">{wish.name}</span>
                    {wish.relation && ` · ${wish.relation}`} · {formatWishDate(wish.created_at)}
                    {!wish.approved && <span className="ml-1 text-red-600">(hidden)</span>}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </form>
      )}
    </div>
  );
}
