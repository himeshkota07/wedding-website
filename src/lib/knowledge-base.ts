import "server-only";
import { after } from "next/server";
import { createAdminSupabase } from "@/lib/supabase-admin";
import { embedTexts } from "@/lib/gemini";
import { getHomeHero, getOurStory, getKnowledgeBaseNotes } from "@/lib/site-settings";

export type Chunk = { source_type: string; source_id: string; content: string };

function formatEventDate(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  });
}

/**
 * Every fact the chatbot knows, built from current DB content. The chat
 * route calls this on each question and gives the model all of it: the whole
 * site is a few dozen short facts, so there's no need to embed and search
 * (which ran into Gemini's free embedding quota and served stale content
 * whenever a rebuild failed). Admin edits reach the chatbot immediately.
 */
export async function buildKnowledgeBase(admin = createAdminSupabase()): Promise<Chunk[]> {
  const [{ data: events }, { data: venues }, { data: family }, { data: faqs }, { data: contacts }, hero, ourStory, notes] =
    await Promise.all([
      admin
        .from("events")
        .select("id, name, description, event_date, special_instructions, venue:venues(name, address)")
        .returns<
          {
            id: string;
            name: string;
            description: string | null;
            event_date: string;
            special_instructions: string | null;
            venue: { name: string; address: string } | { name: string; address: string }[] | null;
          }[]
        >(),
      admin.from("venues").select("id, name, address, parking_info, accessibility_info, nearby_landmarks"),
      admin.from("family_members").select("id, side, role, name, bio"),
      admin.from("faqs").select("id, question, answer"),
      admin.from("contacts").select("id, name, role, phone, whatsapp_link"),
      getHomeHero(admin),
      getOurStory(admin),
      getKnowledgeBaseNotes(admin),
    ]);

  const chunks: Chunk[] = [];

  chunks.push({
    source_type: "general",
    source_id: "couple",
    content: `The wedding is for ${hero.bride_name} and ${hero.groom_name}. ${hero.wedding_date_label} in ${hero.location}. ${hero.welcome_note}`,
  });

  if (ourStory.content) {
    chunks.push({ source_type: "our_story", source_id: "our_story", content: `Our story: ${ourStory.content}` });
  }

  for (const event of events ?? []) {
    const venue = Array.isArray(event.venue) ? event.venue[0] : event.venue;
    chunks.push({
      source_type: "event",
      source_id: event.id,
      content: [
        `Event: ${event.name}.`,
        event.description,
        `Date & time: ${formatEventDate(event.event_date)} (India time).`,
        venue && `Venue: ${venue.name}, ${venue.address}.`,
        event.special_instructions && `Special instructions: ${event.special_instructions}`,
      ]
        .filter(Boolean)
        .join(" "),
    });
  }

  for (const venue of venues ?? []) {
    chunks.push({
      source_type: "venue",
      source_id: venue.id,
      content: [
        `Venue: ${venue.name}, located at ${venue.address}.`,
        venue.parking_info && `Parking: ${venue.parking_info}.`,
        venue.accessibility_info && `Accessibility: ${venue.accessibility_info}.`,
        venue.nearby_landmarks && `Nearby landmarks: ${venue.nearby_landmarks}.`,
      ]
        .filter(Boolean)
        .join(" "),
    });
  }

  for (const member of family ?? []) {
    chunks.push({
      source_type: "family",
      source_id: member.id,
      content: `${member.name} is the ${member.role} on the ${member.side}'s side. ${member.bio ?? ""}`.trim(),
    });
  }

  for (const faq of faqs ?? []) {
    chunks.push({ source_type: "faq", source_id: faq.id, content: `Q: ${faq.question} A: ${faq.answer}` });
  }

  const noteParagraphs = notes.content
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  noteParagraphs.forEach((paragraph, i) => {
    chunks.push({ source_type: "notes", source_id: `notes-${i}`, content: paragraph });
  });

  for (const contact of contacts ?? []) {
    chunks.push({
      source_type: "contact",
      source_id: contact.id,
      content: [
        `${contact.name}${contact.role ? ` (${contact.role})` : ""} can be reached for logistics questions.`,
        contact.phone && `Phone: ${contact.phone}.`,
        contact.whatsapp_link && `WhatsApp: ${contact.whatsapp_link}.`,
      ]
        .filter(Boolean)
        .join(" "),
    });
  }

  return chunks;
}

/**
 * Rebuilds the embedded copy of the knowledge base in `content_chunks`,
 * after any admin mutation (or "Resync now"). The chatbot no longer reads it;
 * it is kept for the admin dashboard's count and as an index if search is
 * ever needed again.
 */
export async function syncKnowledgeBase() {
  const admin = createAdminSupabase();
  const chunks = await buildKnowledgeBase(admin);

  const embeddings = await embedTexts(
    chunks.map((c) => c.content),
    "RETRIEVAL_DOCUMENT",
  );

  await admin.from("content_chunks").delete().neq("source_id", "");

  if (chunks.length > 0) {
    await admin.from("content_chunks").insert(
      chunks.map((chunk, i) => ({
        source_type: chunk.source_type,
        source_id: chunk.source_id,
        content: chunk.content,
        embedding: embeddings[i],
      })),
    );
  }
}

// Gemini's free embedding quota is per minute, and each sync embeds every
// chunk, so a few saves in a row can exhaust it. Waits long enough for the
// quota window to move on before trying again.
const BACKGROUND_RETRY_DELAYS_MS = [15_000, 45_000];

/**
 * Rebuild the knowledge base after the admin's save has already been
 * answered. The edit itself is stored before this runs, so a busy or
 * rate-limited Gemini must never turn a successful save into an error (it
 * did: saves showed as failed even though the content had been written).
 * On final failure the chatbot keeps answering from the previous version
 * until the next save or a manual "Resync now".
 */
export function scheduleKnowledgeBaseSync() {
  after(async () => {
    for (let attempt = 0; ; attempt++) {
      try {
        await syncKnowledgeBase();
        return;
      } catch (error) {
        if (attempt >= BACKGROUND_RETRY_DELAYS_MS.length) {
          console.error("[knowledge-base] background sync gave up; chatbot keeps the previous version:", error);
          return;
        }
        console.warn(`[knowledge-base] background sync failed (attempt ${attempt + 1}), retrying:`, error);
        await new Promise((resolve) => setTimeout(resolve, BACKGROUND_RETRY_DELAYS_MS[attempt]));
      }
    }
  });
}
