import Link from "next/link";
import QRCode from "qrcode";
import SubmitButton from "@/components/admin/SubmitButton";
import { createAdminSupabase } from "@/lib/supabase-admin";
import { getAllLinks, linkUrl, type InviteLink } from "@/lib/invite-links";
import CopyButton from "./CopyButton";
import { issueNewCode, renameLink, saveEventVisibility, saveFaqVisibility, saveNoteVisibility } from "./actions";

const card = "rounded-lg border border-black/10 bg-white p-4 shadow-sm";
const saveButton = "rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-white";

/** One row of "who sees this" checkboxes, a column per link. */
function VisibilityRow({
  label,
  rowId,
  links,
  isShown,
  lockedFor,
}: {
  label: React.ReactNode;
  rowId: string;
  links: InviteLink[];
  isShown: (link: InviteLink) => boolean;
  lockedFor?: (link: InviteLink) => boolean;
}) {
  return (
    <tr className="border-t border-black/5">
      <td className="py-2 pr-4 text-sm text-zinc-800">{label}</td>
      {links.map((link) => {
        const locked = lockedFor?.(link) ?? false;
        return (
          <td key={link.id} className="px-2 py-2 text-center">
            <input
              type="checkbox"
              name="show"
              value={`${rowId}:${link.id}`}
              defaultChecked={isShown(link)}
              disabled={locked}
              title={locked ? "This link always shows every event" : undefined}
              aria-label={`${typeof label === "string" ? label : "Item"} on ${link.label}`}
              className="h-5 w-5 accent-[var(--color-accent)] disabled:opacity-60"
            />
          </td>
        );
      })}
    </tr>
  );
}

function LinkHeaders({ links }: { links: InviteLink[] }) {
  return (
    <thead>
      <tr>
        <th />
        {links.map((link) => (
          <th key={link.id} className="max-w-[9rem] px-2 pb-2 text-center text-xs font-semibold text-zinc-600">
            {link.label}
          </th>
        ))}
      </tr>
    </thead>
  );
}

export default async function AdminLinksPage() {
  const admin = createAdminSupabase();
  const links = await getAllLinks(admin);

  if (links.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-2xl font-semibold text-zinc-900">Invitation links</h1>
        <p className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          Invitation links aren&apos;t set up yet. Run <code>supabase/migrations/0008_invite_links.sql</code> in the
          Supabase SQL editor, then reload this page.
        </p>
      </div>
    );
  }

  const [{ data: events }, { data: faqs }, { data: notes }, { data: eventLinks }, { data: faqHidden }, { data: noteHidden }] =
    await Promise.all([
      admin.from("events").select("id, name, event_date").order("sort_order"),
      admin.from("faqs").select("id, question").order("sort_order"),
      admin.from("chatbot_notes").select("id, content").order("sort_order"),
      admin.from("event_invite_links").select("event_id, link_id"),
      admin.from("faq_hidden_links").select("faq_id, link_id"),
      admin.from("note_hidden_links").select("note_id, link_id"),
    ]);
  const shown = new Set((eventLinks ?? []).map((r) => `${r.event_id}:${r.link_id}`));
  const faqOff = new Set((faqHidden ?? []).map((r) => `${r.faq_id}:${r.link_id}`));
  const noteOff = new Set((noteHidden ?? []).map((r) => `${r.note_id}:${r.link_id}`));
  const qrCodes = await Promise.all(
    links.map((link) =>
      QRCode.toString(linkUrl(link), { type: "svg", margin: 1, width: 120, color: { dark: "#4a2a1d", light: "#ffffff" } }),
    ),
  );

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-2xl font-semibold text-zinc-900">Invitation links</h1>
      <p className="mt-1 text-zinc-600">
        Each guest list gets its own link. A link shows only its events, and the chatbot on that link knows only those
        events. The plain address shows the smallest list, so removing the code from a link never shows more.
      </p>

      <div className="mt-6 space-y-4">
        {links.map((link, i) => (
          <div key={link.id} className={`${card} flex flex-col gap-4 sm:flex-row sm:items-start`}>
            <div
              className="shrink-0 self-start rounded border border-black/10 bg-white p-1"
              aria-label={`QR code for ${link.label}`}
              dangerouslySetInnerHTML={{ __html: qrCodes[i] }}
            />
            <div className="min-w-0 flex-1 space-y-3">
              <form action={renameLink} className="flex flex-wrap items-end gap-2">
                <input type="hidden" name="id" value={link.id} />
                <label className="min-w-0 flex-1 text-sm">
                  Name (only you see this)
                  <input
                    name="label"
                    defaultValue={link.label}
                    required
                    maxLength={80}
                    className="mt-1 w-full rounded-md border border-black/20 px-2 py-1.5 text-sm"
                  />
                </label>
                <SubmitButton className={saveButton}>Save name</SubmitButton>
              </form>
              <div className="flex flex-wrap items-center gap-2">
                <code className="break-all rounded bg-zinc-100 px-2 py-1 text-sm text-zinc-800">{linkUrl(link)}</code>
                <CopyButton text={linkUrl(link)} />
              </div>
              <p className="text-sm text-zinc-500">
                {link.is_default
                  ? "The plain site address, with no code."
                  : link.shows_all_events
                    ? "Always shows every event, including any you add later."
                    : "Shows only the events ticked for it below."}
              </p>
              {!link.is_default && (
                <form action={issueNewCode}>
                  <input type="hidden" name="id" value={link.id} />
                  <SubmitButton
                    pendingLabel="Issuing…"
                    doneLabel="New link issued"
                    className="rounded-md border border-red-300 px-3 py-1.5 text-sm font-medium text-red-600"
                  >
                    Issue a new link (the current one stops working)
                  </SubmitButton>
                </form>
              )}
            </div>
          </div>
        ))}
      </div>

      <h2 className="mt-10 text-lg font-semibold text-zinc-900">Which events each link shows</h2>
      <p className="mt-1 text-sm text-zinc-600">
        A new event appears only on links that always show every event, until you tick it here for the others.
      </p>
      <form action={saveEventVisibility} className={`${card} mt-3 overflow-x-auto`}>
        <table className="w-full">
          <LinkHeaders links={links} />
          <tbody>
            {(events ?? []).map((event) => (
              <VisibilityRow
                key={event.id}
                label={event.name}
                rowId={event.id}
                links={links}
                isShown={(link) => link.shows_all_events || shown.has(`${event.id}:${link.id}`)}
                lockedFor={(link) => link.shows_all_events}
              />
            ))}
          </tbody>
        </table>
        <SubmitButton className={`${saveButton} mt-3`}>Save events</SubmitButton>
      </form>

      <h2 className="mt-10 text-lg font-semibold text-zinc-900">Which FAQs each link&apos;s chatbot knows</h2>
      <p className="mt-1 text-sm text-zinc-600">
        Untick an FAQ for a link if it talks about an event that link doesn&apos;t show.
      </p>
      <form action={saveFaqVisibility} className={`${card} mt-3 overflow-x-auto`}>
        <table className="w-full">
          <LinkHeaders links={links} />
          <tbody>
            {(faqs ?? []).map((faq) => (
              <VisibilityRow
                key={faq.id}
                label={faq.question}
                rowId={faq.id}
                links={links}
                isShown={(link) => !faqOff.has(`${faq.id}:${link.id}`)}
              />
            ))}
          </tbody>
        </table>
        <SubmitButton className={`${saveButton} mt-3`}>Save FAQs</SubmitButton>
      </form>

      <h2 className="mt-10 text-lg font-semibold text-zinc-900">Which chatbot notes each link knows</h2>
      <p className="mt-1 text-sm text-zinc-600">
        Write and edit the notes on the <Link href="/admin/notes" className="text-accent underline">Chatbot notes</Link>{" "}
        page.
      </p>
      <form action={saveNoteVisibility} className={`${card} mt-3 overflow-x-auto`}>
        <table className="w-full">
          <LinkHeaders links={links} />
          <tbody>
            {(notes ?? []).map((note) => (
              <VisibilityRow
                key={note.id}
                label={note.content.length > 90 ? `${note.content.slice(0, 90)}…` : note.content}
                rowId={note.id}
                links={links}
                isShown={(link) => !noteOff.has(`${note.id}:${link.id}`)}
              />
            ))}
          </tbody>
        </table>
        {!notes?.length && <p className="text-sm text-zinc-500">No chatbot notes yet.</p>}
        <SubmitButton className={`${saveButton} mt-3`}>Save notes</SubmitButton>
      </form>
    </div>
  );
}
