import { NextResponse, type NextRequest } from "next/server";

/**
 * One address for the whole site. On the live deployment, a request to any
 * other host (the old wedding-website-…vercel.app alias, a deployment's own
 * URL) is sent to the same path on NEXT_PUBLIC_SITE_URL, so printed QR codes,
 * shared invitation links and admin bookmarks keep working. Preview
 * deployments and local development are left alone.
 */
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;

export function proxy(request: NextRequest) {
  if (process.env.VERCEL_ENV !== "production" || !SITE_URL) return NextResponse.next();
  const site = new URL(SITE_URL);
  if (request.nextUrl.host === site.host) return NextResponse.next();

  const target = new URL(request.nextUrl.pathname + request.nextUrl.search, site);
  return NextResponse.redirect(target, 308);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
