import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { FAST_MODELS, generateWithFallback } from "@/lib/gemini";
import { buildKnowledgeBase } from "@/lib/knowledge-base";
import { SCRIPT_LANGUAGE, dominantScript, dropBracketedEnglish, strayScriptLetters, type Script } from "@/lib/scripts";
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

/**
 * Belt and braces for the plain-text rule: strip the Markdown the model slips
 * in anyway. Bullets become "•" first; after that no asterisk has any use in
 * a guest-facing reply, so every remaining one is removed (pairs next to ":"
 * or ")", unclosed "**", "***" all used to slip through).
 */
function stripMarkdown(text: string) {
  return text
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^[ \t]*[-*+][ \t]+/gm, "• ")
    .replace(/__(.+?)__/g, "$1")
    .replace(/`+/g, "")
    .replace(/\*/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .trim();
}

// Names written twice ("तरुण्या (Tarunya)") were also read aloud twice.
const ONE_NAME_RULE =
  "Write each name of a person or place once: either in this script or in English letters as in the Context, never both, and never add the other spelling in brackets.";

/** Tells the model exactly which language and script to answer in, decided from the guest's own message. */
function replyLanguageRule(target: Script) {
  if (target === "latin") {
    return 'Reply language: the guest wrote in English letters. Reply only in English letters: in English, or, if they wrote Hindi, Telugu or Kannada in English letters (e.g. "shaadi kab hai?"), in that language in English letters. Do not use Telugu, Kannada or Devanagari script unless they explicitly ask how to write something in it.';
  }
  const { language, script } = SCRIPT_LANGUAGE[target];
  const others = (["telugu", "kannada", "devanagari"] as const)
    .filter((s) => s !== target)
    .map((s) => SCRIPT_LANGUAGE[s].script)
    .join(" or ");
  return `Reply language: ${language}. Write the entire reply in ${language}, in ${script} only. Do not use any ${others} letters anywhere in the reply. ${ONE_NAME_RULE}`;
}

/**
 * If a reply still mixes in another Indian script (the model drifts between
 * Telugu and Kannada, which look alike to it), ask once for a clean rewrite in
 * the guest's script, and keep whichever version is cleaner.
 */
async function enforceScript(reply: string, target: Script) {
  if (strayScriptLetters(reply, target) === 0) return reply;
  const { language, script } = SCRIPT_LANGUAGE[target];
  console.warn(`[chat] reply mixed scripts (target ${target}); rewriting`);
  try {
    const rewrite = await generateWithFallback(
      {
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `Rewrite this reply entirely in ${language}, using only ${script}. Keep the meaning, facts, dates, times and numbers exactly the same. ${ONE_NAME_RULE} Plain text, no Markdown. Reply with the rewritten text only.\n\n${reply}`,
              },
            ],
          },
        ],
        config: { temperature: 0.2 },
      },
      FAST_MODELS,
    );
    const fixed = dropBracketedEnglish(stripMarkdown(rewrite.text?.trim() ?? ""));
    return fixed && strayScriptLetters(fixed, target) < strayScriptLetters(reply, target) ? fixed : reply;
  } catch (error) {
    console.warn("[chat] script rewrite failed; sending the original reply:", error);
    return reply;
  }
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
    // Decided from the guest's own letters, not left to the model.
    const target = dominantScript(message);
    const contents = [
      ...history.map((turn) => ({ role: turn.role, parts: [{ text: turn.text }] })),
      {
        role: "user" as const,
        parts: [
          {
            text: `Today (India): ${todayInIndia()}\n\nContext (this wedding's knowledge base):\n${context}\n\n${replyLanguageRule(target)}\n\nGuest question: ${message}`,
          },
        ],
      },
    ];

    const response = await generateWithFallback({
      contents,
      // Low temperature: the same question gets the same facts, worded much the same, every time.
      config: { systemInstruction: SYSTEM_INSTRUCTION, temperature: 0.3 },
    });

    const draft = dropBracketedEnglish(stripMarkdown(response.text?.trim() ?? ""));
    const reply =
      (draft && (await enforceScript(draft, target))) || "Sorry, I couldn't come up with an answer to that.";
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
