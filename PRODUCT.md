# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Wedding guests of Tarunya & Ashish: close family, out-of-town relatives, and elders. Most arrive on a phone, often by scanning the QR code printed on a paper invite. Many are more comfortable in Telugu or Kannada than English, and some are elderly, so they need large, legible text and an obvious way to ask for help. Different guests attend different functions and need the details for the ones they're invited to.

Secondary users are the admins (the couple, immediate family, or a planner). They edit every detail from `/admin` without a developer.

## Product Purpose

A single source of truth for a multi-day South Indian wedding (Mehendi, Haldi, Sangeet, Wedding, Reception, etc.) that replaces or supplements paper cards. It works when a guest can quickly answer "when, where, what do I wear, whom do I call" for each function, and when the site feels like the family's invitation, not a template.

## Positioning

It's the family's own invitation brought to life. It extends the printed card's world, answers questions in the guest's own language by text or voice, and is kept current by the family.

## Operating Context

- The paper engagement invite (`../Ashish&Tarunya.png`) is issued by Kota's Family and carries a QR code that leads guests here.
- Guests revisit during the wedding week for schedules, directions, the live gallery, and uploading their photos.
- Admins update content in `/admin`, which is backed by Supabase. Gallery photos are stored in Cloudinary.

## Capabilities and Constraints

- Next.js 16 App Router, Tailwind v4, motion/react, lucide-react; deployed on Vercel.
- Content comes from Supabase and is edited in the admin panel. It's empty until the admins fill it, so every section needs a graceful empty state.
- Home features: hero with names, date and location, welcome note, countdown, QR code, an opening intro sequence, and an optional background-music toggle.
- Events: per-event countdown, add-to-calendar, theme color, and special instructions.
- Venue: map embed, parking, accessibility, landmarks, and a weather widget.
- Also: family introductions, gallery with guest uploads, FAQ, and contacts (phone and WhatsApp).
- A persistent "Ask us anything" chatbot, with voice, in English, Telugu, and Kannada.
- Undecided: a site-wide multi-language UI toggle and guest-code protection (planned, not built).

## Brand Commitments

- Couple: Tarunya & Ashish. The monogram reads "T & A".
- The printed invite is the binding reference, per the user's direction on 2026-09-28: the site should feel like that card come to life.

## Evidence on Hand

- `../Ashish&Tarunya.png`: the engagement invite. It shows Sunday 06 September, 10:30 am, at Sambhrama, Anjanapura Twp, Bangalore.
- `../sample_ui.mp4`: a reference for the invitation-site experience the user admires.
- `../Wedding_Website_Master_Plan.docx`: the feature plan.
- No couple photos, story text, event list, family list, or contacts exist yet. Don't fabricate them.

## Product Principles

1. Guests first, elders especially: legibility and clarity win over ornament.
2. The site is the family's invitation, not a generic wedding template.
3. Every function's when, where, and what-to-know must be findable in seconds on a phone.
4. Help is always one tap away, in the guest's language.
5. Empty states must still feel intentional while the family is filling in content.

## Accessibility & Inclusion

Elderly and multilingual audience: generous type sizes, strong contrast, large tap targets, respect for reduced-motion, and no reliance on hover.
