import React from "react";
import Link from "next/link";
import { Container } from "../layout/Container";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getUpcomingEvents } from "@/lib/content";
import { ArrowUpRight } from "lucide-react";

export function EventsSection() {
  const events = getUpcomingEvents();

  return (
    <section id="events" className="border-b border-border bg-surface py-20 sm:py-28">
      <Container>
        {/* Section Header */}
        <SectionHeader
          index="03"
          label="LIVE DATES"
          title="Tour Calendar"
          action={
            <Link href="/events" tabIndex={-1}>
              <Button variant="outline" size="sm">
                All Tour Dates (Past & Upcoming)
                <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" aria-hidden="true" />
              </Button>
            </Link>
          }
        />

        {/* Tour Dates List */}
        <div className="mt-10 divide-y divide-border border-y border-border">
          {events.length === 0 ? (
            <div className="py-12 text-center font-mono text-xs text-text-muted">
              NO UPCOMING TOUR DATES CURRENTLY ANNOUNCED.
            </div>
          ) : (
            events.map((event) => {
              const isSoldOut = event.status === "sold-out";
              return (
                <div
                  key={event.id}
                  className="group flex flex-col gap-4 py-6 transition-colors duration-fast hover:bg-surface-active/50 sm:flex-row sm:items-center sm:justify-between sm:px-4"
                >
                  {/* Date & Time */}
                  <div className="flex items-center gap-4 sm:w-48 shrink-0">
                    <div className="font-mono text-sm font-bold uppercase text-accent">
                      {event.date}
                    </div>
                    {event.time && (
                      <span className="font-mono text-xs text-text-muted">
                        {event.time}
                      </span>
                    )}
                  </div>

                  {/* Venue & Event Name */}
                  <div className="flex-1 space-y-1">
                    <h3 className="font-display text-base font-bold uppercase tracking-tight text-text-primary group-hover:text-accent transition-colors duration-fast">
                      {event.eventName}
                    </h3>
                    <div className="flex items-center gap-2 font-mono text-xs text-text-muted">
                      <span>{event.venue}</span>
                      <span>—</span>
                      <span className="text-text-primary">
                        {event.city}, {event.country}
                      </span>
                    </div>
                  </div>

                  {/* Status & Ticket CTA */}
                  <div className="flex items-center gap-3 self-start sm:self-auto shrink-0 pt-2 sm:pt-0">
                    <Badge
                      label={event.status}
                      variant={isSoldOut ? "signal" : "neutral"}
                      showDot={isSoldOut}
                    />

                    {event.ticketUrl && !isSoldOut && (
                      <a
                        href={event.ticketUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        tabIndex={-1}
                      >
                        <Button variant="outline" size="sm">
                          Tickets
                          <ArrowUpRight className="ml-1 h-3 w-3" aria-hidden="true" />
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Container>
    </section>
  );
}
