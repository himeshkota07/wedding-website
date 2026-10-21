"use client";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

/** The family's own visits to /admin would only muddy the guest numbers. */
function guestOnly<T extends { url: string }>(event: T) {
  return new URL(event.url).pathname.startsWith("/admin") ? null : event;
}

/** Vercel Web Analytics and Speed Insights, read in the Vercel dashboard. */
export default function SiteAnalytics() {
  return (
    <>
      <Analytics beforeSend={guestOnly} />
      <SpeedInsights beforeSend={guestOnly} />
    </>
  );
}
