/**
 * Browser-safe helpers for invitation-link paths (/i/<code>). The page knows
 * its own link from the address bar; the server still decides what that code
 * may see (src/lib/invite-links.ts).
 */
export function inviteCodeFromPath(pathname: string): string | null {
  return pathname.match(/^\/i\/([a-z0-9]+(?:-[a-z0-9]+)*)(?:\/|$)/)?.[1] ?? null;
}

/** The home page of the invitation link the visitor is on: "/i/<code>" or "/". */
export function invitationHome(pathname: string) {
  const code = inviteCodeFromPath(pathname);
  return code ? `/i/${code}` : "/";
}
