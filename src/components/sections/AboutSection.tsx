import React from "react";
import { Container } from "../layout/Container";
import { Badge } from "@/components/ui/Badge";
import { artist } from "@/src/config/artist";

export function AboutSection() {
  return (
    <section id="about" className="border-b border-border bg-surface py-20 sm:py-28">
      <Container>
        {/* Section Header with Editorial Numbering */}
        <div className="flex flex-col gap-2 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-accent">
              [01] // PROFILE
            </span>
            <h2 className="mt-1 font-display text-3xl font-bold uppercase tracking-tight text-text-primary sm:text-4xl">
              About The Artist
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              label={artist.bookingAvailability === "available" ? "BOOKING OPEN" : "LIMITED"}
              variant={artist.bookingAvailability === "available" ? "accent" : "neutral"}
            />
          </div>
        </div>

        {/* Content Grid */}
        <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* Metadata Column */}
          <div className="space-y-6 lg:col-span-4 border-l-2 border-border pl-6">
            <div>
              <span className="font-mono text-xs uppercase tracking-wider text-text-muted">
                Location & Base
              </span>
              <p className="mt-1 font-mono text-sm font-semibold uppercase text-text-primary">
                {artist.location}
              </p>
            </div>

            <div>
              <span className="font-mono text-xs uppercase tracking-wider text-text-muted">
                Sonic Disciplines
              </span>
              <ul className="mt-2 space-y-1">
                {artist.genres.map((genre) => (
                  <li key={genre} className="font-mono text-xs text-text-primary">
                    <span className="text-accent mr-1.5">▪</span>
                    {genre}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <span className="font-mono text-xs uppercase tracking-wider text-text-muted">
                Current Status
              </span>
              <div className="mt-1.5">
                <Badge label={artist.status} variant="signal" showDot />
              </div>
            </div>
          </div>

          {/* Biography Column */}
          <div className="space-y-6 lg:col-span-8">
            <p className="font-body text-lg leading-relaxed text-text-primary font-medium">
              {artist.mediumBio || artist.bio}
            </p>
            <div className="space-y-4 font-body text-sm leading-relaxed text-text-muted whitespace-pre-line">
              {artist.longBio}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
