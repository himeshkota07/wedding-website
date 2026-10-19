import "server-only";
import { cache } from "react";
import { createAdminSupabase } from "@/lib/supabase-admin";

/**
 * Invitation links (see supabase/migrations/0008_invite_links.sql). Each
 * guest list gets its own link; the page, the venues and the chatbot only
 * ever see what that link may see. The plain address is the default link and
 * shows the smallest set, so trimming a secret link never reveals more.
 * Everything here runs on the server with the service-role key: the link
 * codes and the full event list must never reach the browser.
 */
export type InviteLink = {
  id: string;
  label: string;
  code: string | null;
  is_default: boolean;
  shows_all_events: boolean;
  sort_order: number;
};

/** What one link may see. */
export type LinkScope = {
  link: InviteLink;
  eventIds: Set<string>;
  /** Start times of this link's events, earliest first. */
  eventDates: string[];
  venueIds: Set<string>;
  hiddenFaqIds: Set<string>;
  hiddenNoteIds: Set<string>;
};

const LINK_COLUMNS = "id, label, code, is_default, shows_all_events, sort_order";
// "family" (the name chosen in /admin/links), or an older random code like
// "k7m2q9x4p1ab". Mirrors the check in migration 0011.
const CODE_PATTERN = /^(?=.{2,40}$)[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Before migration 0008 has run there are no links: behave as the site always did (everything visible). */
const LEGACY_LINK: InviteLink = {
  id: "legacy",
  label: "Everyone",
  code: null,
  is_default: true,
  shows_all_events: true,
  sort_order: 0,
};

/**
 * Links used to end in a random 5-character code ("family-k7m2q"); migration
 * 0011 dropped it. The name an old address now goes by, or null.
 */
export function nameFromOldCode(code: string) {
  return code.match(/^(.+)-[a-z0-9]{5}$/)?.[1] ?? null;
}

export function isPlausibleCode(code: string) {
  return CODE_PATTERN.test(code);
}

export function linkPath(link: Pick<InviteLink, "code">) {
  return link.code ? `/i/${link.code}` : "/";
}

export function linkUrl(link: Pick<InviteLink, "code">) {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, "");
  return link.code ? `${base}/i/${link.code}` : base;
}

export async function getAllLinks(admin = createAdminSupabase()): Promise<InviteLink[]> {
  const { data, error } = await admin.from("invite_links").select(LINK_COLUMNS).order("sort_order");
  if (error) {
    console.warn("[invite-links] links unavailable (run migration 0008?):", error.message);
    return [];
  }
  return data as InviteLink[];
}

/**
 * The link for a request: the one with this code, or the plain-address link
 * when there's no code or it doesn't match (a mistyped code shows the
 * smallest set, never more).
 */
export const resolveLink = cache(async (code: string | null | undefined): Promise<InviteLink> => {
  const links = await getAllLinks();
  if (links.length === 0) return LEGACY_LINK;
  const byCode = code && isPlausibleCode(code) ? links.find((l) => l.code === code) : undefined;
  return byCode ?? links.find((l) => l.is_default) ?? LEGACY_LINK;
});

/** Looks up a secret link by its code only; null when there's no such link. */
export const findLinkByCode = cache(async (code: string): Promise<InviteLink | null> => {
  if (!isPlausibleCode(code)) return null;
  const links = await getAllLinks();
  return links.find((l) => l.code === code) ?? null;
});

/** Everything `link` may see. Cached per request, since several sections ask. */
export const getLinkScope = cache(async (link: InviteLink): Promise<LinkScope> => {
  const admin = createAdminSupabase();
  const legacy = link.id === LEGACY_LINK.id;
  const [{ data: events }, { data: venues }, ticked, hiddenFaqs, hiddenNotes] = await Promise.all([
    admin.from("events").select("id, venue_id, event_date"),
    admin.from("venues").select("id"),
    link.shows_all_events || legacy
      ? Promise.resolve({ data: [] as { event_id: string }[] })
      : admin.from("event_invite_links").select("event_id").eq("link_id", link.id),
    legacy ? Promise.resolve({ data: [] }) : admin.from("faq_hidden_links").select("faq_id").eq("link_id", link.id),
    legacy ? Promise.resolve({ data: [] }) : admin.from("note_hidden_links").select("note_id").eq("link_id", link.id),
  ]);

  const allEvents = events ?? [];
  const eventIds =
    link.shows_all_events || legacy
      ? new Set(allEvents.map((e) => e.id as string))
      : new Set((ticked.data ?? []).map((r) => r.event_id as string));

  // A venue is shown when one of this link's events is there, or when no
  // event uses it at all (general venue information); never when it only
  // hosts events this link can't see.
  const usedVenues = new Set(allEvents.map((e) => e.venue_id as string | null).filter(Boolean));
  const visibleVenues = new Set(
    allEvents.filter((e) => eventIds.has(e.id as string)).map((e) => e.venue_id as string | null).filter(Boolean),
  );
  const venueIds = new Set(
    (venues ?? []).map((v) => v.id as string).filter((id) => visibleVenues.has(id) || !usedVenues.has(id)),
  );

  return {
    link,
    eventIds,
    eventDates: allEvents
      .filter((e) => eventIds.has(e.id as string))
      .map((e) => e.event_date as string)
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime()),
    venueIds: venueIds as Set<string>,
    hiddenFaqIds: new Set((hiddenFaqs.data ?? []).map((r) => (r as { faq_id: string }).faq_id)),
    hiddenNoteIds: new Set((hiddenNotes.data ?? []).map((r) => (r as { note_id: string }).note_id)),
  };
});
