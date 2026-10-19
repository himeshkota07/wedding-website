"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { createAdminSupabase } from "@/lib/supabase-admin";

function revalidateLinks() {
  revalidatePath("/", "layout"); // every invitation link's page
  revalidatePath("/admin/links");
}

/** "Family & Friends!" -> "family-friends": lowercase letters and digits joined by hyphens. */
function toLinkName(input: string) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 30)
    .replace(/-+$/, "");
}

/**
 * Names a link: "/i/family". A new name means a new address; the old one
 * stops working. If another link already has the name, it becomes
 * "family-2", "family-3", and so on.
 */
export async function setLinkName(formData: FormData) {
  await requireAdmin();
  const name = toLinkName(String(formData.get("name") ?? ""));
  if (name.length < 2) return;
  const admin = createAdminSupabase();
  const id = String(formData.get("id"));
  for (let n = 1; n <= 9; n++) {
    const code = n === 1 ? name : `${name}-${n}`;
    const { error } = await admin.from("invite_links").update({ code }).eq("id", id).eq("is_default", false);
    if (!error) break;
    if (error.code !== "23505") throw error; // anything but "already taken"
  }
  revalidateLinks();
}

export async function renameLink(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const label = String(formData.get("label") ?? "").trim().slice(0, 80);
  if (!label) return;
  await createAdminSupabase().from("invite_links").update({ label }).eq("id", id);
  revalidateLinks();
}

/** Ticked boxes arrive as "<rowId>:<linkId>" values of one field; everything else is unticked. */
function tickedPairs(formData: FormData, field: string) {
  return new Set(formData.getAll(field).map(String));
}

type PairTable = "event_invite_links" | "faq_hidden_links" | "note_hidden_links";

/**
 * Makes `table` hold exactly `wanted` ("<rowId>:<linkId>" pairs), changing
 * only the differences, so a failed write can't wipe everyone's visibility.
 */
async function syncPairs(table: PairTable, key: "event_id" | "faq_id" | "note_id", wanted: Set<string>) {
  const admin = createAdminSupabase();
  const { data: existing, error } = await admin.from(table).select(`${key}, link_id`);
  if (error) throw error;
  const current = new Set((existing ?? []).map((r) => `${(r as Record<string, string>)[key]}:${r.link_id}`));
  const toPair = (pair: string) => {
    const [rowId, linkId] = pair.split(":");
    return { [key]: rowId, link_id: linkId };
  };
  const add = [...wanted].filter((p) => !current.has(p)).map(toPair);
  const remove = [...current].filter((p) => !wanted.has(p)).map(toPair);
  if (add.length) {
    const { error: addError } = await admin.from(table).insert(add);
    if (addError) throw addError;
  }
  for (const row of remove) {
    await admin.from(table).delete().eq(key, row[key]).eq("link_id", row.link_id);
  }
}

/** Events: a link (other than an "all events" one) shows exactly the events ticked for it. */
export async function saveEventVisibility(formData: FormData) {
  await requireAdmin();
  const admin = createAdminSupabase();
  const [{ data: events }, { data: links }] = await Promise.all([
    admin.from("events").select("id"),
    admin.from("invite_links").select("id, shows_all_events"),
  ]);
  const ticked = tickedPairs(formData, "show");
  const wanted = new Set(
    (events ?? []).flatMap((e) =>
      (links ?? []).filter((l) => !l.shows_all_events && ticked.has(`${e.id}:${l.id}`)).map((l) => `${e.id}:${l.id}`),
    ),
  );
  await syncPairs("event_invite_links", "event_id", wanted);
  revalidateLinks();
}

/** FAQs and notes are shown everywhere unless unticked, so what's stored is where they're hidden. */
async function saveHidden(formData: FormData, table: "faq_hidden_links" | "note_hidden_links", source: "faqs" | "chatbot_notes") {
  const admin = createAdminSupabase();
  const key = table === "faq_hidden_links" ? "faq_id" : "note_id";
  const [{ data: items }, { data: links }] = await Promise.all([
    admin.from(source).select("id"),
    admin.from("invite_links").select("id"),
  ]);
  const ticked = tickedPairs(formData, "show");
  const hidden = new Set(
    (items ?? []).flatMap((item) =>
      (links ?? []).filter((l) => !ticked.has(`${item.id}:${l.id}`)).map((l) => `${item.id}:${l.id}`),
    ),
  );
  await syncPairs(table, key, hidden);
  revalidateLinks();
}

export async function saveFaqVisibility(formData: FormData) {
  await requireAdmin();
  await saveHidden(formData, "faq_hidden_links", "faqs");
}

export async function saveNoteVisibility(formData: FormData) {
  await requireAdmin();
  await saveHidden(formData, "note_hidden_links", "chatbot_notes");
}
