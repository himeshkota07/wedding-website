import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_LINK_COOKIE, ADMIN_LINK_MAX_AGE_SECONDS, adminLinkCookieValue, isValidAdminLinkToken } from "@/lib/admin-auth";

/**
 * The shareable admin link. A valid token drops a cookie and lands on the
 * dashboard; anything else goes to the ordinary login page, which says
 * nothing about whether link access exists.
 */
export async function GET(request: NextRequest, ctx: RouteContext<"/admin/enter/[token]">) {
  const { token } = await ctx.params;
  const cookieValue = adminLinkCookieValue();

  if (!cookieValue || !isValidAdminLinkToken(token)) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const response = NextResponse.redirect(new URL("/admin", request.url));
  response.cookies.set(ADMIN_LINK_COOKIE, cookieValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/admin",
    maxAge: ADMIN_LINK_MAX_AGE_SECONDS,
  });
  return response;
}
