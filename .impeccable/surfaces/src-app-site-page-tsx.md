---
version: 1
slug: "src-app-site-page-tsx"
primary_target: "src/app/(site)/page.tsx"
related_targets: ["src/app/(site)/layout.tsx"]
---

# Home (guest site)

Scope: public guest site under src/app/(site): home page, nav, footer, floating chat, opening sequence, shared ui. Mode: persuade (the invitation) carrying read-heavy logistics.
Audience: guests incl. elders, phone-first via QR on paper invite, Telugu/Kannada/English.
Constraints: all content from Supabase/admin; graceful empty states; keep chat, music, gallery upload, countdown, add-to-calendar, QR, weather.
User decisions (2026-09-28): match the printed invite world; build "walk through the mandapam"; replace the puppet opening with a marigold curtain that parts to reveal the names; keep the dancing couple; sample fallbacks from the invite (Tarunya & Ashish, Sambhrama, Bangalore).

## Direction contract

THESIS: The site is the kalyana mandapam you walk into, not a template hero with stacked cards. Refuses the centered-monogram-over-blurred-gradient wedding page.

OWN-WORLD: Parchment ground from the card, but committed fields: a teak canopy beam (deep wood brown) carrying hanging marigold strings; turmeric yellow and kumkum red plates; banana-leaf green; brass rules. Flat cut shapes layered for depth: no blurred blobs, no soft shadows (raise from papercut). Serif display with a Telugu-card warmth, humanist body.

STORY: Guests step in under the garlands, learn who/when/where at once, then walk bay by bay: story, functions, venue, family, gallery, questions, whom to call.

FIRST VIEWPORT: teak beam across the top with the nav and swaying marigold strings; carved pillar plus banana stem framing left and right; an invitation sentence leading into the names (issuer line such as "Kota's Family" held until the user confirms who hosts the wedding), names very large, a date block like the card (big numeral | weekday / month / time), venue line, countdown, primary action "See the functions".

FORM: kalyana mandapam, #4 of grounded list (invite card, lagna patrika, thoranam, mandapam, kanchi border, muggu, tambulam tray); seed 7e04d6af. Raise (ticket wallet): each function is a fixed-field stub, When · Where · Wear · Note, same positions every time. Raise (papercut): depth only by overlap. Signature interaction: marigold curtain opening; garlands sway once on load.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
