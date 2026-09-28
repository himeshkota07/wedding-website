import { Phone, MessageCircle } from "lucide-react";
import PageSection from "@/components/PageSection";
import { supabase } from "@/lib/supabase";
import Card from "@/components/ui/Card";
import Reveal from "@/components/ui/Reveal";

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
          <Reveal key={contact.id}>
            <Card padding="sm" className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-medium text-ink">{contact.name}</div>
                {contact.role && <div className="text-sm text-foreground/60">{contact.role}</div>}
              </div>
              <div className="flex gap-4 text-sm">
                {contact.phone && (
                  <a
                    className="flex items-center gap-1.5 font-medium text-accent transition-colors hover:text-accent-deep"
                    href={`tel:${contact.phone.replace(/\s/g, "")}`}
                  >
                    <Phone size={15} />
                    {contact.phone}
                  </a>
                )}
                {contact.whatsapp_link && (
                  <a
                    className="flex items-center gap-1.5 font-medium text-accent transition-colors hover:text-accent-deep"
                    href={contact.whatsapp_link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle size={15} />
                    WhatsApp
                  </a>
                )}
              </div>
            </Card>
          </Reveal>
        ))}
      </div>
    </PageSection>
  );
}
