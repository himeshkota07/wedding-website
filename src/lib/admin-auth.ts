import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase-server";
import { createAdminSupabase } from "@/lib/supabase-admin";

/**
 * Two ways in:
 * 1. The shared admin link, /admin/enter/<ADMIN_ACCESS_TOKEN>. Whoever opens
 *    it gets a long-lived cookie, so anyone the family sends the link to can
 *    edit without an account. Changing ADMIN_ACCESS_TOKEN revokes every
 *    link and cookie issued so far.
 * 2. Emailed magic link, for addresses on the `admins` allow-list.
 */
export const ADMIN_LINK_COOKIE = "wedding_admin_link";
export const ADMIN_LINK_MAX_AGE_SECONDS = 60 * 60 * 24 * 180;

// The cookie holds a value derived from the token rather than the token
// itself, so a leaked cookie can't be turned back into the shareable link.
function linkCookieValue(token: string) {
  return createHmac("sha256", token).update("wedding-admin-link-v1").digest("base64url");
}

function safeEqual(a: string, b: string) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

/** The configured link token, or null when link access is switched off (unset or too short to be safe). */
function configuredToken() {
  const token = process.env.ADMIN_ACCESS_TOKEN ?? "";
  return token.length >= 32 ? token : null;
}

export function isValidAdminLinkToken(candidate: string) {
  const token = configuredToken();
  return token !== null && safeEqual(candidate, token);
}

export function adminLinkCookieValue() {
  const token = configuredToken();
  return token ? linkCookieValue(token) : null;
}

async function hasAdminLinkCookie() {
  const expected = adminLinkCookieValue();
  if (!expected) return false;
  const value = (await cookies()).get(ADMIN_LINK_COOKIE)?.value;
  return value !== undefined && safeEqual(value, expected);
}

export type AdminIdentity = { email: string | null; viaSharedLink: boolean };

/**
 * Confirms the caller holds the shared admin link OR is signed in AND on the
 * admins allow-list. Redirects to /admin/login otherwise. Call this at the
 * top of every admin page and every admin server action. There's no proxy
 * guard, and Server Actions wouldn't be covered by one anyway.
 */
export async function requireAdmin(): Promise<AdminIdentity> {
  if (await hasAdminLinkCookie()) {
    return { email: null, viaSharedLink: true };
  }

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect("/admin/login");
  }

  const adminSupabase = createAdminSupabase();
  const { data: allowed } = await adminSupabase
    .from("admins")
    .select("email")
    .eq("email", user.email)
    .maybeSingle();

  if (!allowed) {
    redirect("/admin/login?error=not_authorized");
  }

  return { email: user.email, viaSharedLink: false };
}
