import PageSection from "@/components/PageSection";
import { supabase } from "@/lib/supabase";

export const revalidate = 60;

export default async function FaqPage() {
  const { data: faqs } = await supabase
    .from("faqs")
    .select("id, question, answer")
    .order("sort_order", { ascending: true });

  return (
    <PageSection title="FAQ & Chat" subtitle="Answers guests need, on demand">
      {!faqs?.length && <p>FAQs will be added soon.</p>}
      <div className="divide-y divide-black/10 rounded-lg border border-black/10 bg-white shadow-sm">
        {faqs?.map((faq) => (
          <details key={faq.id} className="group p-4">
            <summary className="cursor-pointer list-none font-medium text-zinc-900 marker:content-none">
              {faq.question}
            </summary>
            <p className="mt-2 text-zinc-600">{faq.answer}</p>
          </details>
        ))}
      </div>
      <p className="rounded-lg border border-dashed border-black/20 p-4 text-sm text-zinc-500">
        [Placeholder — the chatbot widget (text + voice, Telugu/Kannada/English) goes here.]
      </p>
    </PageSection>
  );
}
