import { Phone, MessageCircle } from "lucide-react";
import PageSection from "@/components/PageSection";
import { supabase } from "@/lib/supabase";

export default async function ContactSection({ qrCode }: { qrCode: React.ReactNode }) {
  const { data: contacts } = await supabase
    .from("contacts")
    .select("id, name, role, phone, whatsapp_link")
    .order("sort_order", { ascending: true });

  return (
    <PageSection id="contact" tone="blush" title="Contact" subtitle="Whom to call for anything on the day: travel, rooms, directions.">
      <div className="grid gap-14 lg:grid-cols-[1.6fr_1fr] lg:gap-16">
        <div>
          {!contacts?.length && (
            <p className="text-lg text-ink-soft">Coordinators&apos; names and numbers will be added here soon.</p>
          )}
          <ul>
            {contacts?.map((contact) => (
              <li
                key={contact.id}
                className="flex flex-wrap items-center justify-between gap-4 border-t border-ink/15 py-5 last:border-b"
              >
                <div>
                  <p className="font-display text-2xl text-ink">{contact.name}</p>
                  {contact.role && <p className="text-ink-soft">{contact.role}</p>}
                </div>
                <div className="flex flex-wrap gap-2">
                  {contact.phone && (
                    <a
                      className="inline-flex h-12 items-center gap-2 rounded-full bg-kumkum px-5 font-semibold text-paper transition-colors hover:bg-kumkum-deep"
                      href={`tel:${contact.phone.replace(/\s/g, "")}`}
                    >
                      <Phone size={18} />
                      Call {contact.phone}
                    </a>
                  )}
                  {contact.whatsapp_link && (
                    <a
                      className="inline-flex h-12 items-center gap-2 rounded-full border border-ink/25 px-5 font-semibold text-ink transition-colors hover:border-kumkum hover:text-kumkum-deep"
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
