import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { generateWithFallback } from "@/lib/gemini";
import { buildKnowledgeBase } from "@/lib/knowledge-base";
import { createAdminSupabase } from "@/lib/supabase-admin";

// Give retries room within Vercel's function budget, but the individual
// Gemini call timeout (see src/lib/gemini.ts) keeps a single request from
// hanging indefinitely under quota pressure.
export const maxDuration = 30;

const MAX_MESSAGE_LENGTH = 500;
const MAX_HISTORY_TURNS = 6;

type ChatTurn = { role: "user" | "model"; text: string };

const SYSTEM_INSTRUCTION = `You are a friendly assistant for a wedding website, answering guest questions about the events, venues, family, and logistics, and helping with anything around the trip.

How to answer, in this order:
1. The wedding's own knowledge base comes first. The "Context" below is everything the family has written about THIS wedding. If it answers the question, answer from it, and let it overrule anything you think you know.
2. If the Context doesn't cover it, you may answer from your own general knowledge: what a ceremony like Haldi, Sangeet or Muhurtham usually involves, Telugu and Kannada wedding customs, getting around Bangalore, travel from the airport, typical weather, what to pack, etiquette, and similar. Make it clear this is general guidance, e.g. "Generally…" or "Usually…", not something the family has confirmed.
3. Never invent facts about THIS wedding that aren't in the Context: its dates, times, venues, addresses, people, phone numbers, dress code, menu, gifts, accommodation or arrangements. If the guest asks about one of these and the Context doesn't have it, say you don't have that detail yet and suggest the WhatsApp link or the Contact section. You can still add useful general advice alongside.
4. If the Context seems to contradict itself (for example two different dates for the same thing), give what the Context says and suggest confirming with the family.
- Reply in the same language the guest wrote in (English, Telugu, Kannada, or Hindi). Match their language even if the context is in English. Write Hindi in Devanagari; if a guest writes Hindi in English letters (e.g. "shaadi kab hai?"), reply the same way, in English letters.
- Keep answers short and warm, like a helpful friend, not a formal document.
- In English, call the wedding's programme items "events", never "functions", even where the context says "function".
- Write plain text only: no Markdown, no asterisks, no headings. The chat shows text exactly as written and may read it aloud. For several items, put each on its own short line.`;

/** Belt and braces for the plain-text rule: strip Markdown emphasis the model slips in anyway. */
function stripMarkdown(text: string) {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/(^|\s)\*(\S[^*]*?)\*(?=\s|$|[.,!?])/g, "$1$2")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^[ \t]*[-*][ \t]+/gm, "• ");
}

/** So general answers ("how many days until…", "is it monsoon season?") are anchored to the real date. */
function todayInIndia() {
  return new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
}

function buildContext(chunks: { source_type: string; content: string }[]) {
  if (chunks.length === 0) return "(no information has been added yet)";
  return chunks.map((c) => `- [${c.source_type}] ${c.content}`).join("\n");
}

async function getWhatsappLink(admin: ReturnType<typeof createAdminSupabase>) {
  const { data } = await admin
    .from("contacts")
    .select("whatsapp_link")
    .not("whatsapp_link", "is", null)
    .order("sort_order", { ascending: true })
    .limit(1);
  return data?.[0]?.whatsapp_link as string | undefined;
}

export async function POST(request: NextRequest) {
  let body: { message?: unknown; history?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!message) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json({ error: "Message is too long" }, { status: 400 });
  }

  const history: ChatTurn[] = Array.isArray(body.history)
    ? body.history
        .filter(
          (t): t is ChatTurn =>
            typeof t === "object" && t !== null && (t.role === "user" || t.role === "model") && typeof t.text === "string",
        )
        .slice(-MAX_HISTORY_TURNS)
    : [];

  const admin = createAdminSupabase();

  try {
    // The model reads the whole, current knowledge base rather than a
    // searched subset (see buildKnowledgeBase). The system instruction makes
    // it admit when the answer isn't there.
    const context = buildContext(await buildKnowledgeBase(admin));
    const contents = [
      ...history.map((turn) => ({ role: turn.role, parts: [{ text: turn.text }] })),
      {
        role: "user" as const,
        parts: [{ text: `Today (India): ${todayInIndia()}\n\nContext (this wedding's knowledge base):\n${context}\n\nGuest question: ${message}` }],
      },
    ];

    const response = await generateWithFallback({
      contents,
      config: { systemInstruction: SYSTEM_INSTRUCTION },
    });

    const reply = stripMarkdown(response.text?.trim() ?? "") || "Sorry, I couldn't come up with an answer to that.";
    return NextResponse.json({ reply, escalate: false });
  } catch (error) {
    console.error("[chat] failed:", error);
    const whatsappLink = await getWhatsappLink(admin).catch(() => undefined);
    return NextResponse.json({
      reply:
        "Sorry, I'm having trouble answering right now. " +
        (whatsappLink ? `Please try the coordinators on WhatsApp: ${whatsappLink}` : "Please try again shortly."),
      escalate: true,
    });
  }
}
