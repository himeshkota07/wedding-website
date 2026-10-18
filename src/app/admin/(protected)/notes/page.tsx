import Link from "next/link";
import SubmitButton from "@/components/admin/SubmitButton";
import { createAdminSupabase } from "@/lib/supabase-admin";
import { Field, TextAreaField, FormActions } from "@/components/admin/Field";
import { createNote, updateNote, deleteNote } from "./actions";

export default async function AdminNotesPage() {
  const { data: notes, error } = await createAdminSupabase()
    .from("chatbot_notes")
    .select("id, content, sort_order")
    .order("sort_order", { ascending: true });

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-2xl font-semibold text-zinc-900">Chatbot notes</h1>
      <p className="mt-1 text-zinc-600">
        Extra facts the chatbot can use that don&apos;t belong anywhere else on the site, one per note. Every
        invitation link&apos;s chatbot knows a new note; to keep one away from a guest list, untick it on the{" "}
        <Link href="/admin/links" className="text-accent underline">
          Links
        </Link>{" "}
        page.
      </p>

      {error && (
        <p className="mt-6 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          Chatbot notes aren&apos;t set up yet. Run <code>supabase/migrations/0008_invite_links.sql</code> in the
          Supabase SQL editor, then reload this page.
        </p>
      )}

      <div className="mt-6 space-y-6">
        {notes?.map((note) => (
          <form key={note.id} action={updateNote} className="space-y-3 rounded-lg border border-black/10 bg-white p-4 shadow-sm">
            <input type="hidden" name="id" value={note.id} />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <TextAreaField label="Note" name="content" defaultValue={note.content} span2 />
              <Field label="Sort order" name="sort_order" type="number" defaultValue={note.sort_order} />
            </div>
            <FormActions deleteAction={deleteNote} />
          </form>
        ))}
      </div>

      {!error && (
        <>
          <h2 className="mt-10 text-lg font-semibold text-zinc-900">Add a note</h2>
          <form action={createNote} className="mt-3 space-y-3 rounded-lg border border-black/10 bg-white p-4 shadow-sm">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <TextAreaField label="Note" name="content" span2 />
              <Field label="Sort order" name="sort_order" type="number" defaultValue={(notes?.length ?? 0) + 1} />
            </div>
            <SubmitButton pendingLabel="Adding…" doneLabel="Added" className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-white">
              Add note
            </SubmitButton>
          </form>
        </>
      )}
    </div>
  );
}
