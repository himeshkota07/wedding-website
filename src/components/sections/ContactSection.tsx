import PageSection from "@/components/PageSection";
import { supabase } from "@/lib/supabase";

export default async function ContactSection() {
  const { data: contacts } = await supabase
    .from("contacts")
    .select("id, name, role, phone, whatsapp_link")
    .order("sort_order", { ascending: true });

  return (
    <PageSection id="contact" title="Contact" subtitle="Whom to reach for logistics">
      {!contacts?.length && <p>Contact details will be added soon.</p>}
      <div className="space-y-4">
        {contacts?.map((contact) => (
          <div
            key={contact.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-black/10 bg-white p-4 shadow-sm"
          >
            <div>
              <div className="font-medium text-zinc-900">{contact.name}</div>
              {contact.role && <div className="text-sm text-zinc-500">{contact.role}</div>}
            </div>
            <div className="flex gap-3 text-sm">
              {contact.phone && (
                <a className="font-medium text-accent" href={`tel:${contact.phone.replace(/\s/g, "")}`}>
                  {contact.phone}
                </a>
              )}
              {contact.whatsapp_link && (
                <a
                  className="font-medium text-accent"
                  href={contact.whatsapp_link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </PageSection>
  );
}
