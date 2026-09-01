import "server-only";
import { createAdminSupabase } from "@/lib/supabase-admin";
import { embedTexts } from "@/lib/gemini";
import { getHomeHero, getOurStory } from "@/lib/site-settings";

type Chunk = { source_type: string; source_id: string; content: string };

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
 * Rebuilds the entire chatbot knowledge base from current DB content. Called
 * after any admin mutation to events/venues/family/faqs/contacts/site content
 * -- a full resync rather than incremental updates, since the content volume
 * here is tiny (a few dozen rows) and Gemini embeddings are free, so the
 * simplicity is worth more than the (negligible) extra API calls.
 */
export async function syncKnowledgeBase() {
  const admin = createAdminSupabase();

  const [{ data: events }, { data: venues }, { data: family }, { data: faqs }, { data: contacts }, hero, ourStory] =
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
