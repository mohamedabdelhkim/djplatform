import React from "react";
import { Container } from "@/components/layout/Container";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getUpcomingEvents, getPastEvents } from "@/lib/content";
import { ArrowUpRight } from "lucide-react";

export const metadata = {
  title: "Tour Dates & Live Events | DJ Platform",
  description: "Schedule of upcoming club appearances, warehouse showcases, festivals, and past tour archive.",
};

export default function EventsPage() {
  const upcomingEvents = getUpcomingEvents();
  const pastEvents = getPastEvents();

  return (
    <div className="py-16 sm:py-24">
      <Container>
        {/* Header */}
        <SectionHeader
          as="h1"
          index="SCHEDULE"
          label="TOUR"
          title="Tour Schedule"
          description="Confirmed tour dates, festival appearances, and historical performance archive."
          className="pb-8"
        />

        {/* Upcoming Gigs */}
        <div className="mt-16">
          <div className="flex items-center gap-2 mb-8">
            <span className="h-2 w-2 bg-accent" aria-hidden="true" />
            <h2 className="font-mono text-sm uppercase tracking-widest text-text-primary">
              Upcoming Tour Dates
            </h2>
          </div>

          <div className="divide-y divide-border border-y border-border">
            {upcomingEvents.map((event) => {
              const isSoldOut = event.status === "sold-out";
              return (
                <div
                  key={event.id}
                  className="group flex flex-col gap-4 py-6 transition-colors duration-fast hover:bg-surface-active/50 sm:flex-row sm:items-center sm:justify-between sm:px-4"
                >
                  <div className="flex items-center gap-4 sm:w-48 shrink-0">
                    <span className="font-mono text-sm font-bold uppercase text-accent">
                      {event.date}
                    </span>
                    {event.time && (
                      <span className="font-mono text-xs text-text-muted">
                        {event.time}
                      </span>
                    )}
                  </div>

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
            })}
          </div>
        </div>

        {/* Past Gigs Archive */}
        <div className="mt-20 border-t border-border pt-16">
          <div className="flex items-center gap-2 mb-8">
            <span className="h-2 w-2 bg-text-muted" aria-hidden="true" />
            <h2 className="font-mono text-sm uppercase tracking-widest text-text-muted">
              Past Tour Archive
            </h2>
          </div>

          <div className="divide-y divide-border border-y border-border opacity-70">
            {pastEvents.map((event) => (
              <div
                key={event.id}
                className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-4 font-mono text-xs"
              >
                <div className="w-48 text-text-muted">{event.date}</div>
                <div className="flex-1 text-text-primary uppercase font-bold">
                  {event.eventName} <span className="text-text-muted font-normal">@ {event.venue}</span>
                </div>
                <div className="text-text-muted">
                  {event.city}, {event.country}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}
