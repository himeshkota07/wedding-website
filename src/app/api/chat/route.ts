import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { embedTexts, generateWithFallback } from "@/lib/gemini";
import { createAdminSupabase } from "@/lib/supabase-admin";

// Give retries room within Vercel's function budget, but the individual
// Gemini call timeout (see src/lib/gemini.ts) keeps a single request from
// hanging indefinitely under quota pressure.
export const maxDuration = 30;

const MAX_MESSAGE_LENGTH = 500;
const MAX_HISTORY_TURNS = 6;
const LOW_CONFIDENCE_THRESHOLD = 0.35;

type ChatTurn = { role: "user" | "model"; text: string };

const SYSTEM_INSTRUCTION = `You are a friendly assistant for a wedding website, answering guest questions about the events, venues, family, and logistics.

Rules:
- Answer ONLY using the "Context" provided below. Do not invent details (dates, addresses, names) that aren't in the context.
- If the context doesn't contain the answer, say clearly that you don't have that information and suggest the guest reach out via the WhatsApp link or Contact section -- do not guess.
- Reply in the same language the guest wrote in (English, Telugu, or Kannada). Match their language even if the context is in English.
- Keep answers short and warm, like a helpful friend, not a formal document.`;

function buildContext(chunks: { source_type: string; content: string }[]) {
  if (chunks.length === 0) return "(no matching information found)";
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
    const [queryEmbedding] = await embedTexts([message], "RETRIEVAL_QUERY");

    const { data: matches } = await admin.rpc("match_content_chunks", {
      query_embedding: queryEmbedding,
      match_count: 6,
    });

    const bestSimilarity = matches?.[0]?.similarity ?? 0;

    if (bestSimilarity < LOW_CONFIDENCE_THRESHOLD) {
      const whatsappLink = await getWhatsappLink(admin);
      return NextResponse.json({
        reply:
          "I don't have information about that yet. " +
          (whatsappLink
            ? `Could you ask the coordinators directly on WhatsApp? ${whatsappLink}`
            : "Please check the Contact section for a coordinator to ask."),
        escalate: true,
      });
    }

    const context = buildContext(matches ?? []);
    const contents = [
      ...history.map((turn) => ({ role: turn.role, parts: [{ text: turn.text }] })),
      {
        role: "user" as const,
        parts: [{ text: `Context:\n${context}\n\nGuest question: ${message}` }],
      },
    ];

    const response = await generateWithFallback({
      contents,
      config: { systemInstruction: SYSTEM_INSTRUCTION },
    });

    const reply = response.text?.trim() || "Sorry, I couldn't come up with an answer to that.";
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
