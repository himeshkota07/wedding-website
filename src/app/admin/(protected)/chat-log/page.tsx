import { requireAdmin } from "@/lib/admin-auth";
import { createAdminSupabase } from "@/lib/supabase-admin";

const SHOWN = 300;

const LANGUAGES: Record<string, string> = {
  latin: "English letters",
  telugu: "Telugu",
  kannada: "Kannada",
  devanagari: "Hindi",
};

type Entry = {
  id: number;
  created_at: string;
  invite_label: string | null;
  question: string;
  reply: string | null;
  script: string | null;
  failed: boolean;
};

function when(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  });
}

function dayAgo() {
  return new Date(Date.now() - 24 * 3_600_000).toISOString();
}

function tally(entries: Entry[], key: (e: Entry) => string) {
  const counts = new Map<string, number>();
  for (const e of entries) counts.set(key(e), (counts.get(key(e)) ?? 0) + 1);
  return [...counts].sort((a, b) => b[1] - a[1]);
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-black/10 bg-white p-4 shadow-sm">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-zinc-900">{value}</p>
    </div>
  );
}

function Breakdown({ title, rows }: { title: string; rows: [string, number][] }) {
  return (
    <div className="rounded-lg border border-black/10 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-zinc-900">{title}</h2>
      <ul className="mt-2 space-y-1 text-sm text-zinc-700">
        {rows.map(([label, count]) => (
          <li key={label} className="flex justify-between gap-3">
            <span>{label}</span>
            <span className="tabular-nums text-zinc-500">{count}</span>
          </li>
        ))}
        {!rows.length && <li className="text-zinc-500">Nothing yet.</li>}
      </ul>
    </div>
  );
}

/** What guests ask the chatbot and what it told them, newest first. */
export default async function AdminChatLogPage() {
  await requireAdmin();
  const admin = createAdminSupabase();
  const [{ data, error }, { count: total }, { count: lastDay }, { count: failed }] = await Promise.all([
    admin
      .from("chat_log")
      .select("id, created_at, invite_label, question, reply, script, failed")
      .order("created_at", { ascending: false })
      .limit(SHOWN)
      .returns<Entry[]>(),
    admin.from("chat_log").select("id", { count: "exact", head: true }),
    admin.from("chat_log").select("id", { count: "exact", head: true }).gte("created_at", dayAgo()),
    admin.from("chat_log").select("id", { count: "exact", head: true }).eq("failed", true),
  ]);
  const entries = data ?? [];

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-2xl font-semibold text-zinc-900">Chat log</h1>
      <p className="mt-1 text-zinc-600">
        Every question guests ask the chatbot, and the answer they got, newest first. Questions it couldn&apos;t answer
        well are worth adding to the FAQs or event details.
      </p>

      {error ? (
        <p className="mt-6 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          Couldn&apos;t load the chat log: {error.message}. If the table is missing, run
          <code className="mx-1">supabase/migrations/0013_chat_log.sql</code>in the Supabase SQL editor.
        </p>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Stat label="Questions in total" value={total ?? 0} />
            <Stat label="In the last 24 hours" value={lastDay ?? 0} />
            <Stat label="Chatbot had trouble" value={failed ?? 0} />
          </div>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Breakdown title="By invitation link" rows={tally(entries, (e) => e.invite_label ?? "Unknown")} />
            <Breakdown
              title="By language"
              rows={tally(entries, (e) => (e.script && LANGUAGES[e.script]) || "Unknown")}
            />
          </div>
          {(total ?? 0) > SHOWN && (
            <p className="mt-3 text-sm text-zinc-500">The breakdowns and list cover the latest {SHOWN} questions.</p>
          )}

          <ul className="mt-6 space-y-3">
            {entries.map((e) => (
              <li
                key={e.id}
                className={`rounded-lg border bg-white p-4 shadow-sm ${e.failed ? "border-red-300" : "border-black/10"}`}
              >
                <p className="text-xs text-zinc-500">
                  {when(e.created_at)} · {e.invite_label ?? "Unknown link"}
                  {e.script && ` · ${LANGUAGES[e.script] ?? e.script}`}
                  {e.failed && <span className="ml-1 font-medium text-red-600">· had trouble</span>}
                </p>
                <p className="mt-1 font-medium text-zinc-900">{e.question}</p>
                {e.reply && <p className="mt-2 whitespace-pre-line text-sm text-zinc-600">{e.reply}</p>}
              </li>
            ))}
            {!entries.length && <li className="text-sm text-zinc-500">No questions yet.</li>}
          </ul>
        </>
      )}
    </div>
  );
}
