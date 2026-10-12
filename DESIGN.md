---
name: Tarunya & Ashish Wedding
description: A watercolour wedding card come to life, with the chat as its front door.
colors:
  paper: "#fcfaf6"
  paper-deep: "#f5eee3"
  turmeric: "#eba93c"
  turmeric-deep: "#cb7d1d"
  marigold: "#e2812e"
  kumkum: "#b3262c"
  kumkum-deep: "#8b1b21"
  leaf: "#587626"
  leaf-soft: "#9db35c"
  teak: "#4a2a1d"
  teak-soft: "#6d4331"
  brass: "#c49d6c"
  ink: "#2b211c"
  ink-soft: "#66544a"
  hairline: "#e5d6c0"
  accent-soft: "#f8e2c2"
  gold-soft: "#f2e5d0"
  blush-soft: "#fbe9d8"
typography:
  display:
    fontFamily: "Courgette, cursive"
    fontSize: "clamp(3.25rem, 10vw, 6rem)"
    fontWeight: 400
    lineHeight: 1.05
  headline:
    fontFamily: "Kurale, Georgia, serif"
    fontSize: "clamp(2.25rem, 5vw, 3rem)"
    fontWeight: 400
    lineHeight: 1.25
  title:
    fontFamily: "Kurale, Georgia, serif"
    fontSize: "1.875rem"
    fontWeight: 400
    lineHeight: 1.2
  lead:
    fontFamily: "Kurale, Georgia, serif"
    fontSize: "1.5rem"
    fontWeight: 400
    lineHeight: 1.375
  numeral:
    fontFamily: "Kurale, Georgia, serif"
    fontSize: "clamp(2.25rem, 5vw, 3rem)"
    fontWeight: 400
    lineHeight: 1
    fontFeature: "tnum"
  body:
    fontFamily: "Anek Latin, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.6
  body-large:
    fontFamily: "Anek Latin, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Anek Latin, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.12em"
rounded:
  none: "0px"
  focus: "2px"
  bubble: "16px"
  full: "9999px"
spacing:
  gutter: "20px"
  gutter-wide: "32px"
  bay-top: "40px"
  bay-top-wide: "56px"
  bay-bottom: "80px"
  bay-bottom-wide: "112px"
  block: "48px"
  control-height: "48px"
components:
  button-primary:
    backgroundColor: "{colors.kumkum}"
    textColor: "{colors.paper}"
    typography: "{typography.body}"
    rounded: "{rounded.full}"
    padding: "0 24px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.kumkum-deep}"
    textColor: "{colors.paper}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    padding: "0 20px"
    height: "48px"
  button-outline-hover:
    textColor: "{colors.kumkum}"
  button-on-teak:
    backgroundColor: "{colors.turmeric}"
    textColor: "{colors.teak}"
    rounded: "{rounded.full}"
    padding: "0 20px"
    height: "48px"
  button-on-teak-hover:
    backgroundColor: "{colors.paper}"
  button-on-leaf:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.leaf}"
    rounded: "{rounded.full}"
    padding: "0 24px"
    height: "48px"
  button-on-leaf-hover:
    backgroundColor: "{colors.turmeric}"
    textColor: "{colors.teak}"
  input-text:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: "0 12px"
    height: "48px"
  nav-beam:
    backgroundColor: "{colors.teak}"
    textColor: "{colors.paper}"
    height: "64px"
  function-slip:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "8px"
  bay-turmeric:
    backgroundColor: "{colors.turmeric}"
    textColor: "{colors.ink}"
  bay-leaf:
    backgroundColor: "{colors.leaf}"
    textColor: "{colors.paper}"
  bay-teak:
    backgroundColor: "{colors.teak}"
    textColor: "{colors.paper}"
  family-seal:
    backgroundColor: "{colors.turmeric}"
    textColor: "{colors.teak}"
    rounded: "{rounded.full}"
    size: "48px"
---

# Design System: Tarunya & Ashish Wedding

## Overview

> **2026-10-12 update: "Watercolour".** At the user's direction the theme now comes from a watercolour of the couple's feet (`public/theme/couple-feet.jpg`): her henna'd feet in a red-and-saffron saree, his in a tan dhoti with a green border, orange petals scattered around. The palette tokens keep their old names (`teak` is now henna brown, `brass` the dhoti's tan, `kumkum` the saree red), so the rules below still read correctly by token. The hero is centred, with the painting standing at the foot of the page instead of the pillar and garland art. Functions are **Umbrella Cards** (`public/theme/event-card.jpg`), not slips. The chat is the site's front door: it opens by itself after the curtain. The umbrella card and the chat panel may carry one soft shadow; everything else stays flat.

**Creative North Star: "Walk Through the Mandapam"**

The site is the kalyana mandapam a guest walks into, built out of the family's printed invite. A carved teak canopy beam carries the navigation and a row of scallops. Marigold strings and a mango-leaf thoranam hang over every entrance. Each section is a bay you step into under its own thoranam, and each bay stands on a committed field of colour: invite paper, a second sheet of paper, turmeric, banana leaf or teak. The invite's own watercolour art (the pillar, the garland, Ganesha) sits right in the page. It was whitened and multiplied into the paper, so it reads as printed on it and not pasted over it.

Everything is flat and cut out. Depth comes from one sheet overlapping another, the way a papercut or a stack of patrikas gets it. There is no shading, no blur and no soft shadow. The type works like the card: brush lettering for the couple's names, a letterpress serif for headings, and a humanist Indian-foundry sans for everything a guest has to read. The layout is generous and made to be read on a phone: large sizes, 48px targets and one column that opens into two only where the content has two sides.

This replaces the earlier "Rani Pink & Gold" world. Its token names (`accent`, `gold`, `blush`, `accent-deep`) still exist as aliases in `globals.css`, now pointing at the mandapam palette, so the admin panel takes on the new skin without edits.

**Key Characteristics:**
- Committed full-width colour fields per bay, each hung with a thoranam
- Flat cut shapes. Depth by overlap only.
- The invite's own art multiplied into the paper
- Three type voices: brush names, letterpress headings, humanist body
- Pill-shaped actions on square-cornered paper
- Motion happens once: the curtain parts and the garlands swing, then settle

## Colors

The palette is lifted from the watercolour couple: whitened watercolour paper, saree saffron and red, scattered marigold petals, the dhoti's green border and tan, and henna brown. (Earlier it came from the printed invite; the token names are unchanged.)

### Primary
- **Kumkum Red** (kumkum): the colour of doing. Used for primary action pills, the floating chat launcher, the send button, the focus ring and text caret, the "&" between the names, and the date numeral on each function slip. Hover deepens it to **Kumkum Deep** (kumkum-deep).

### Secondary
- **Turmeric** (turmeric): the functions bay's field, text selection, the teak nav's monogram and hover state, the Accordion's plus mark, and the primary pill on dark teak fields. **Turmeric Deep** (turmeric-deep) is only for marigold centres.
- **Marigold** (marigold): the outer petals of every flower in the thoranam and curtain, plus the weather icon. It is a flower colour, never a field.

### Tertiary
- **Banana Leaf** (leaf): the questions bay's field, thoranam leaves, venue detail icons, and the groom-side family seals. **Leaf Soft** (leaf-soft) only appears as the second leaf tone in the thoranam.
- **Brass** (brass): every structural line, including the rule under the beam, the thoranam string, the slip frame (at 60%), the date divider, the countdown diamonds and frames around the map and QR. It is also the scrollbar thumb.

### Neutral
- **Invite Paper** (paper): the page ground and the surface of every slip, input and inner frame.
- **Second Sheet** (paper-deep): the family bay's field, the sheet laid under each function slip, the upload panel and incoming chat bubbles.
- **Teak** (teak): the canopy beam (nav), the contact bay, the footer and the curtain's backdrop. **Teak Soft** (teak-soft) is secondary text on turmeric.
- **Ink** (ink) / **Ink Soft** (ink-soft): body and heading text on light fields, then supporting text, labels and captions.
- **Hairline** (hairline): the ledger rules between rows of fields, family members, venue details and the weather band.
- **Alias-only lights** (accent-soft, gold-soft, blush-soft): kept for the admin panel and the dancing-couple illustration. Guest surfaces don't reach for them directly.

**Alias map (kept for the admin panel):** `accent` → kumkum, `accent-deep` → teak, `gold` → brass, `blush` → marigold, `background` → paper, `foreground` → ink.

### Named Rules
**The Committed Field Rule.** A bay takes a whole field of paper, paper-deep, turmeric, leaf or teak from edge to edge. Colour is never a tinted card floating on paper. Text on leaf and teak is paper, with opacity for supporting lines (75-90%).

**The Kumkum Means Act Rule.** Kumkum is for actions and the one auspicious mark per group: the "&", a slip's date numeral, the focus ring. Don't use it for decoration or a field.

**The Brass Thread Rule.** Structural lines are brass or hairline. They are never grey and never ink.

## Typography

**Display Font:** Courgette (with cursive fallback)
**Heading Font:** Kurale (with Georgia, serif)
**Body Font:** Anek Latin (with system sans). It has Telugu and Kannada siblings for the planned language toggle.

**Character:** The printed card's own voices. Brush lettering is for the couple, a warm letterpress serif is for anything announced, and a humanist Indian-foundry sans is for anything a guest has to read and act on.

### Hierarchy
- **Display** (Courgette 400, clamp 3.25–6rem, 1.05): the couple's names only, in the hero cascade (bride, indented "&" in kumkum, indented groom), the curtain seal, the footer and the nav monogram. The same face sets the big date numeral in the hero and on slips.
- **Headline** (Kurale 400, 2.25rem → 3rem at sm, 1.25): one per bay, the bay title under its thoranam.
- **Title** (Kurale 400, 1.875rem): function names, venue names and family-side headings. Names in lists step down to 1.25–1.5rem.
- **Lead** (Kurale 400, 1.5rem, 1.375): the first paragraph of the story, the invitation sentence, the place name (uppercase at 0.14em tracking) and the weather reading.
- **Numeral** (Kurale 400, 2.25rem → 3rem, leading 1, tabular): the countdown digits, separated by brass diamonds.
- **Body** (Anek Latin 400, 1.0625rem, 1.6): all reading text, capped at 55–65ch. Bay subtitles and intros are set in Body Large (1.125rem).
- **Label** (Anek Latin 600, 0.875rem, 0.12em, uppercase): field labels inside a record only (When, Where, Colour, Please note, Parking, Your name).

### Named Rules
**The Three Hands Rule.** Courgette is for the couple and their date, Kurale is for what is announced, and Anek is for what is read. Never set body copy or buttons in either of the first two.

**The Ledger Label Rule.** Uppercase tracked labels name a field inside a record, sitting on a hairline above their value. They never sit above a heading as a kicker or eyebrow.

## Layout

The page is a vertical walk through bays. Each bay is a full-bleed field with a 44px thoranam strip at its top edge. Content sits in a centred 64rem column (the beam and hero use 72rem) with 20px gutters, rising to 32px at 640px. Bays get 40px top and 80px bottom padding, rising to 56px / 112px. The heading-to-content gap is 40–48px. The hero fills the first viewport minus the beam. On wider screens the text column is offset right (left padding of about 30–34%) so the invite's pillar frames it on the left and the garland hangs at right. On phones the pillar foot sits under the text, fading in through a mask.

Two-column splits appear only where the content has two sides: bride / groom family (md), map beside venue notes, FAQ beside the ask panel, and contacts beside the QR (lg). Each function slip is a fixed grid, with a 10rem date stub then fields in two columns, and the fields sit in the same positions on every slip. The gallery is a 2 → 3 column masonry. Section anchors carry `scroll-mt-16` to clear the sticky beam.

## Elevation & Depth

The system is flat. No element uses `box-shadow`. Depth is conveyed three ways. First, by overlap: a slip lies on a second sheet of paper-deep, offset 8px right and 10px down and rotated 0.7deg. Second, by framing: a paper inset inside a brass hairline frame. Third, by layering flat SVG discs, as a garland-maker builds a marigold. Floating surfaces (the chat panel, the music button) earn their lift from a double frame instead of a shadow: a teak border with a brass outline offset 2px, or a paper ring with a brass outline.

### Named Rules
**The Papercut Rule.** Lift is one sheet laid over another, or a frame around it. If something needs to feel raised, offset a second flat sheet behind it. Don't blur anything.

## Shapes

Paper is square: slips, frames, inputs, the upload panel, the chat panel and the map frame all have 0 corners. Actions are pills (full radius). Seals are circles: family initials, marigold heads and the curtain's name medallion. Ornament is cut geometry, such as the beam's scallops with brass studs, almond leaves, stacked discs, turmeric dabs at a slip's four corners, and brass diamonds between countdown units. Chat bubbles alone use a 16px radius with one tucked 2px corner toward the speaker.

## Components

### Buttons
Pills with conviction, and big enough for elders' thumbs.
- **Shape:** full pill (rounded.full), 48px tall. The floating launcher is 56px and calendar links are 40px.
- **Primary:** kumkum fill, paper text, semibold Anek, 24px side padding, trailing or leading 16–18px line icon.
- **Hover / Focus:** a colour shift only (kumkum → kumkum-deep), with no movement. Focus is a 2px kumkum outline offset 3px.
- **Outline:** a transparent pill with an ink/25% border and ink text. On hover the border and text turn kumkum. This is used for secondary actions and add-to-calendar.
- **On fields:** on teak, a turmeric pill with teak text (hover paper) and a paper/40% outline pill. On leaf, a paper pill with leaf text (hover turmeric with teak text).
- **Text link:** small ink-soft text with an icon, underlined on hover in kumkum ("Watch the opening again").

### Umbrella Card (signature)
Painted umbrellas and jasmine hang over a scalloped arch, and the function is written inside the arch.
- **Structure:** a rounded card in a grid (1, 2 or 3 columns). Centred inside the arch: weekday · month, then a Courgette day numeral in kumkum, the name in Kurale, a compact countdown, an optional description, four fixed fields (When · Where · Colour · Please note) and add-to-calendar last.
- **Art:** `event-card.jpg` pinned to the top at full width. Behind it, `event-card-body.jpg`, a 67px strip of exactly two lace scallops, repeats downward, so a card with a lot to say grows without losing its lace edge. The art ends on a strip boundary to keep the join seamless.
- **Empty state:** the same card with a marigold and "Soon", and "To be announced" in every field.

### Inputs / Fields
- **Style:** paper fill, a brass/70% 1px border, square corners, 48px tall, ink text and ink-soft placeholder. The chat input is the one pill-shaped input (44px).
- **Focus:** the border turns kumkum and the native outline is dropped.

### Navigation (the canopy beam)
- **Style:** a sticky olive-velvet bar 64px tall (`public/theme/nav-velvet.jpg`, darkened so paper text stays above 5.5:1, over the `olive` token), the couple's burgundy wax-seal logo (`public/theme/logo-seal.png`, 96px tall, hung from the bar: centred on its bottom edge, half on the bar and half over the page), and Anek links at 0.95rem in paper/85%. Hover turns a link turmeric with an 8px-offset underline. A brass rule and carved scallop trim hang beneath it.
- **Mobile:** below lg, a menu button opens a two-column link grid inside the beam, with height animated at 0.28s.

### Thoranam
An SVG strip 44px tall at the top of every bay: a brass string, almond leaves in leaf / leaf-soft, and three-disc marigolds in marigold/turmeric and kumkum/marigold. On the leaf bay the leaves switch to paper tones.

### Ledger Rows
FAQ rows, contacts, family members and venue details are rows ruled by hairlines (paper/20–25% on dark fields). They are not cards. The Accordion uses Kurale 1.25rem questions and a turmeric plus that rotates 45deg when open.

### Haldi Dissolve (signature motion)
On every visit, the couple's Haldi illustration (`public/theme/intro-haldi.jpg`; cover and bottom-anchored on portrait screens, whole on its cream `#f9f4e8` on landscape ones) fills the screen with their wax seal resting at the centre. At 2.4s the scene dissolves into the page (0.8s, no split or slide) while the seal shrinks and flies (0.8s) into the nav logo's measured position, and the chat opens as the curtain hands over. The nav's own logo stays hidden while the curtain plays, so only one seal is ever on screen. The curtain can be skipped and replayed, and is omitted entirely under reduced motion. The hero garland swings once on load (3.6s) and then stays still.

### Chat (the front door)
The marigold curtain plays on every visit, and the chat opens by itself once it parts. On a phone it is a sheet over the bottom ~60% of the screen, with the invitation still visible above and at the sides under a light wash; on desktop it is a panel at the bottom right. A "See invitation" button (or Escape, or a tap on the page behind) minimises it to a kumkum "Ask us anything" pill at the bottom right. Minimising lasts for that page view only; every load opens the chat again. The guest never picks a language: Gemini detects English, Telugu or Kannada from the voice, and the bot replies in the language and the mode the guest used: a typed question gets a text answer, and a spoken one is also read aloud automatically in the matching voice. Suggested-question pills sit under the greeting. Bubbles are paper-deep for incoming and kumkum for the guest's own, at 18px for elders.

## Do's and Don'ts

### Do:
- **Do** give every bay a committed field (paper, paper-deep, turmeric, leaf, teak) and hang a thoranam at its top.
- **Do** build depth by overlap: a paper-deep sheet offset 8px / 10px and turned 0.7deg, or a brass frame with a paper inset.
- **Do** use the invite's own art with `mix-blend-multiply` on whitened paper, and keep its provenance embedded.
- **Do** keep actions as 48px pills: kumkum on light fields, turmeric on teak, paper on leaf.
- **Do** set repeated records with identical fields in identical positions, labelled with Ledger Labels on hairlines.
- **Do** use easing `cubic-bezier(0.22, 1, 0.36, 1)` at 0.2–0.3s for UI state, and honour `prefers-reduced-motion` everywhere.
- **Do** keep text on leaf and teak in paper, with supporting lines at 75–90% opacity.

### Don't:
- **Don't** use `box-shadow`, blurred blobs or gradient fills for decoration. A mask fade on invite artwork is the only gradient allowed.
- **Don't** set body copy, buttons or labels in Courgette or Kurale.
- **Don't** put uppercase tracked kickers or eyebrows above headings.
- **Don't** use kumkum as a field or for ornament beyond marigold heads and the slip's corner dabs.
- **Don't** draw lines in grey. Rules are brass or hairline.
- **Don't** round paper surfaces. Corners are square except pills, seals and chat bubbles.
- **Don't** loop ornamental motion. Garlands swing once and settle.
