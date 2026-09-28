"use client";

import { motion, useReducedMotion } from "motion/react";
import { Heart, Flower2, Sparkles } from "lucide-react";
import Countdown from "@/components/Countdown";
import AddToCalendar from "@/components/AddToCalendar";
import Card from "@/components/ui/Card";
import RevealGroup, { revealItemVariants } from "@/components/ui/RevealGroup";

type EventRow = {
  id: string;
  name: string;
  description: string | null;
  event_date: string;
  theme_color: string | null;
  special_instructions: string | null;
  venue: { name: string; address: string } | null;
};

const MARKER_ICONS = [Heart, Flower2, Sparkles];

export default function EventsTimeline({ events }: { events: EventRow[] }) {
  const reduceMotion = useReducedMotion();
  const variants = revealItemVariants(reduceMotion);

  return (
    <RevealGroup className="relative" stagger={0.12}>
      <ol className="relative">
        <div aria-hidden className="absolute bottom-0 left-4 top-0 w-px bg-hairline sm:left-1/2" />
        {events.map((event, i) => {
          const v = event.venue;
          const MarkerIcon = MARKER_ICONS[i % MARKER_ICONS.length];
          const color = event.theme_color ?? "var(--accent)";
          const alignLeft = i % 2 === 0;

          return (
            <motion.li key={event.id} variants={variants} className="relative pb-10 pl-12 last:pb-0 sm:pl-0">
              <span
                aria-hidden
                className="absolute left-4 top-1 flex h-7 w-7 -translate-x-1/2 items-center justify-center rounded-full text-white ring-4 ring-background sm:left-1/2"
                style={{ background: color }}
              >
                <MarkerIcon size={14} />
              </span>

              <div className="sm:grid sm:grid-cols-2 sm:gap-8">
                <div className={alignLeft ? "sm:col-start-1 sm:row-start-1 sm:text-right" : "sm:col-start-2 sm:row-start-1"}>
                  <Card accent={color}>
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h3 className="font-display text-xl font-semibold text-ink">{event.name}</h3>
                      <span className="text-sm text-foreground/50">
                        {new Date(event.event_date).toLocaleString("en-IN", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <Countdown targetIso={event.event_date} compact />
                    {event.description && <p className="mt-1 text-foreground/70">{event.description}</p>}
                    <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-1 text-sm text-foreground/70">
                      {v && (
                        <div>
                          <dt className="inline font-medium text-ink">Venue: </dt>
                          <dd className="inline">{v.name}</dd>
                        </div>
                      )}
                      {event.special_instructions && (
                        <div>
                          <dt className="inline font-medium text-ink">Note: </dt>
                          <dd className="inline">{event.special_instructions}</dd>
                        </div>
                      )}
                    </dl>
                    <div className="mt-3">
                      <AddToCalendar
                        title={event.name}
                        description={event.description}
                        location={v?.address}
                        startIso={event.event_date}
                      />
                    </div>
                  </Card>
                </div>
              </div>
            </motion.li>
          );
        })}
      </ol>
    </RevealGroup>
  );
}
