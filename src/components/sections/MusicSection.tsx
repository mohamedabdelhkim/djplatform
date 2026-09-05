import React from "react";
import Link from "next/link";
import { Container } from "../layout/Container";
import { AudioFacade } from "../audio/AudioFacade";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { getAllReleases, getFeaturedMixes } from "@/src/lib/content";
import { ArrowUpRight, ExternalLink } from "lucide-react";

export function MusicSection() {
  const releases = getAllReleases();
  const mixes = getFeaturedMixes();

  return (
    <section id="music" className="border-b border-border bg-background py-20 sm:py-28">
      <Container>
        {/* Section Header */}
        <div className="flex flex-col gap-2 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-accent">
              [02] // CATALOG & SESSIONS
            </span>
            <h2 className="mt-1 font-display text-3xl font-bold uppercase tracking-tight text-text-primary sm:text-4xl">
              Featured Sound
            </h2>
          </div>
          <Link href="/music" tabIndex={-1}>
            <Button variant="outline" size="sm">
              Full Discography
              <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" aria-hidden="true" />
            </Button>
          </Link>
        </div>

        {/* Part 1: Playable Mixes & Sets (Using AudioFacade) */}
        <div className="mt-12">
          <div className="flex items-center gap-2 mb-6">
            <span className="h-1.5 w-1.5 bg-accent" aria-hidden="true" />
            <h3 className="font-mono text-xs uppercase tracking-widest text-text-muted">
              Live Sets & Recorded Broadcasts
            </h3>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {mixes.map((mix) => (
              <div key={mix.id} className="space-y-2">
                <AudioFacade
                  platform={mix.platform === "youtube" ? "soundcloud" : mix.platform}
                  trackId={mix.id}
                  title={mix.title}
                />
                <p className="font-body text-xs text-text-muted px-1">
                  {mix.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Part 2: Selected Discography Releases */}
        <div className="mt-16 border-t border-border pt-12">
          <div className="flex items-center gap-2 mb-6">
            <span className="h-1.5 w-1.5 bg-text-muted" aria-hidden="true" />
            <h3 className="font-mono text-xs uppercase tracking-widest text-text-muted">
              Recent Vinyl & Digital Releases
            </h3>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {releases.map((release) => (
              <div
                key={release.id}
                className="group border border-border bg-surface p-6 transition-colors duration-fast hover:border-accent"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge label={release.type} variant="neutral" />
                      {release.catalogNumber && (
                        <span className="font-mono text-xs text-text-muted">
                          [{release.catalogNumber}]
                        </span>
                      )}
                    </div>
                    <h4 className="mt-2 font-display text-lg font-bold uppercase tracking-tight text-text-primary">
                      {release.title}
                    </h4>
                    <p className="font-mono text-xs text-text-muted">
                      {release.label} • {release.releaseDate}
                    </p>
                  </div>
                </div>

                <p className="mt-4 font-body text-xs leading-relaxed text-text-muted">
                  {release.description}
                </p>

                {/* Platform Links */}
                <div className="mt-6 flex flex-wrap gap-2 border-t border-border pt-4">
                  {release.externalLinks.map((link) => (
                    <a
                      key={link.platform}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 border border-border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-text-muted transition-colors duration-fast hover:border-accent hover:text-accent"
                    >
                      {link.label}
                      <ExternalLink className="h-2.5 w-2.5" aria-hidden="true" />
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
