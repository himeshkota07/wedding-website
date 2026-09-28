import { Phone, MessageCircle } from "lucide-react";
import PageSection from "@/components/PageSection";
import { supabase } from "@/lib/supabase";

export default async function ContactSection({ qrCode }: { qrCode: React.ReactNode }) {
  const { data: contacts } = await supabase
    .from("contacts")
    .select("id, name, role, phone, whatsapp_link")
    .order("sort_order", { ascending: true });

  return (
    <PageSection id="contact" tone="teak" title="Contact" subtitle="Whom to call for anything on the day: travel, rooms, directions.">
      <div className="grid gap-14 lg:grid-cols-[1.6fr_1fr] lg:gap-16">
        <div>
          {!contacts?.length && (
            <p className="text-lg text-paper/80">Coordinators&apos; names and numbers will be added here soon.</p>
          )}
          <ul>
            {contacts?.map((contact) => (
              <li
                key={contact.id}
                className="flex flex-wrap items-center justify-between gap-4 border-t border-paper/20 py-5 last:border-b"
              >
                <div>
                  <p className="font-display text-2xl text-paper">{contact.name}</p>
                  {contact.role && <p className="text-paper/75">{contact.role}</p>}
                </div>
                <div className="flex flex-wrap gap-2">
                  {contact.phone && (
                    <a
                      className="inline-flex h-12 items-center gap-2 rounded-full bg-turmeric px-5 font-semibold text-teak transition-colors hover:bg-paper"
                      href={`tel:${contact.phone.replace(/\s/g, "")}`}
                    >
                      <Phone size={18} />
                      Call {contact.phone}
                    </a>
                  )}
                  {contact.whatsapp_link && (
                    <a
                      className="inline-flex h-12 items-center gap-2 rounded-full border border-paper/40 px-5 font-semibold text-paper transition-colors hover:border-turmeric hover:text-turmeric"
                      href={contact.whatsapp_link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle size={18} />
                      WhatsApp
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="self-start">{qrCode}</div>
      </div>
    </PageSection>
  );
}
