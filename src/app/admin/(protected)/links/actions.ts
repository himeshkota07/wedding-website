"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { createAdminSupabase } from "@/lib/supabase-admin";
import { linkNameFromCode } from "@/lib/invite-links";

function revalidateLinks() {
  revalidatePath("/", "layout"); // every invitation link's page
  revalidatePath("/admin/links");
}

// Letters and digits that can't be mistaken for each other when an elder reads
// a link aloud or types it from a card: no i, l, o, 0 or 1.
const SUFFIX_ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";

/** 5 random characters: about 28 million possibilities, so a link can't be guessed from its name. */
function randomSuffix() {
  return Array.from(randomBytes(5), (b) => SUFFIX_ALPHABET[b % SUFFIX_ALPHABET.length]).join("");
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

/** "family-k7m2q", or a plain random code when the link has no name yet. */
function newCode(name: string) {
  return name ? `${name}-${randomSuffix()}` : `${randomSuffix()}${randomSuffix()}`;
}

/** Sets a secret link's code, retrying with a fresh suffix in the unlikely event it's taken. */
async function setCode(id: string, name: string) {
  const admin = createAdminSupabase();
  for (let attempt = 0; attempt < 3; attempt++) {
    const { error } = await admin.from("invite_links").update({ code: newCode(name) }).eq("id", id).eq("is_default", false);
    if (!error) return;
    if (error.code !== "23505") throw error; // anything but "already taken"
  }
}

/** Gives a secret link a readable name: "/i/family-k7m2q". A new name means a new link; the old one stops working. */
export async function setLinkName(formData: FormData) {
  await requireAdmin();
  const name = toLinkName(String(formData.get("name") ?? ""));
  if (name.length < 2) return;
  await setCode(String(formData.get("id")), name);
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

/** A leaked link stops working at once; it keeps its name and only the code at the end changes. */
export async function issueNewCode(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const { data } = await createAdminSupabase().from("invite_links").select("code").eq("id", id).single();
  await setCode(id, linkNameFromCode(data?.code ?? null));
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
