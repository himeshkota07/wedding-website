import { createAdminSupabase } from "@/lib/supabase-admin";
import { Field, TextAreaField, FormActions } from "@/components/admin/Field";
import { createFaq, updateFaq, deleteFaq } from "./actions";

export default async function AdminFaqsPage() {
  const admin = createAdminSupabase();
  const { data: faqs } = await admin
    .from("faqs")
    .select("id, question, answer, sort_order")
    .order("sort_order", { ascending: true });

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-2xl font-semibold text-zinc-900">FAQs</h1>

      <div className="mt-6 space-y-6">
        {faqs?.map((faq) => (
          <form key={faq.id} action={updateFaq} className="space-y-3 rounded-lg border border-black/10 bg-white p-4 shadow-sm">
            <input type="hidden" name="id" value={faq.id} />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Question" name="question" defaultValue={faq.question} required span2 />
              <TextAreaField label="Answer" name="answer" defaultValue={faq.answer} span2 />
              <Field label="Sort order" name="sort_order" type="number" defaultValue={faq.sort_order} />
            </div>
            <FormActions deleteAction={deleteFaq} />
          </form>
        ))}
      </div>

      <h2 className="mt-10 text-lg font-semibold text-zinc-900">Add FAQ</h2>
      <form action={createFaq} className="mt-3 space-y-3 rounded-lg border border-black/10 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Question" name="question" required span2 />
          <TextAreaField label="Answer" name="answer" span2 />
          <Field label="Sort order" name="sort_order" type="number" defaultValue={0} />
        </div>
        <button type="submit" className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-white">Add FAQ</button>
      </form>
    </div>
  );
}
