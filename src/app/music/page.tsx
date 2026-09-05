import React from "react";
import { Container } from "@/components/layout/Container";
import { AudioFacade } from "@/components/audio/AudioFacade";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getAllReleases, getAllMixes } from "@/lib/content";
import { ExternalLink } from "lucide-react";

export const metadata = {
  title: "Discography & Mixes | DJ Platform",
  description: "Complete music releases, remixes, vinyl editions, and live recorded DJ sets.",
};

export default function MusicPage() {
  const releases = getAllReleases();
  const mixes = getAllMixes();

  return (
    <div className="py-16 sm:py-24">
      <Container>
        {/* Header */}
        <SectionHeader
          as="h1"
          index="ARCHIVE"
          label="SOUND"
          title="Discography & Mixes"
          description="Complete catalog of studio releases, vinyl pressings, and recorded live sets."
          className="pb-8"
        />

        {/* Recorded DJ Sets */}
        <div className="mt-16">
          <div className="flex items-center gap-2 mb-8">
            <span className="h-2 w-2 bg-accent" aria-hidden="true" />
            <h2 className="font-mono text-sm uppercase tracking-widest text-text-primary">
              Live DJ Sets & Broadcasts
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {mixes.map((mix) => (
              <div key={mix.id} className="space-y-3">
                <AudioFacade
                  platform={mix.platform === "youtube" ? "soundcloud" : mix.platform}
                  trackId={mix.id}
                  title={mix.title}
                />
                <div className="flex items-center justify-between text-xs font-mono text-text-muted px-1">
                  <span>RECORDED: {mix.date}</span>
                  <span>DURATION: {mix.duration}</span>
                </div>
                {mix.tracklist && (
                  <div className="border border-border bg-surface p-3 font-mono text-xs text-text-muted space-y-1">
                    <span className="font-bold text-text-primary block text-[10px] uppercase">
                      Tracklist Excerpt:
                    </span>
                    {mix.tracklist.map((track, i) => (
                      <div key={i} className="truncate">
                        {i + 1}. {track}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Discography */}
        <div className="mt-20 border-t border-border pt-16">
          <div className="flex items-center gap-2 mb-8">
            <span className="h-2 w-2 bg-text-muted" aria-hidden="true" />
            <h2 className="font-mono text-sm uppercase tracking-widest text-text-primary">
              All Releases
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {releases.map((release) => (
              <Card
                key={release.id}
                variant="interactive"
                className="p-6"
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
                    <h3 className="mt-2 font-display text-xl font-bold uppercase tracking-tight text-text-primary">
                      {release.title}
                    </h3>
                    <p className="font-mono text-xs text-text-muted">
                      {release.label} • {release.releaseDate}
                    </p>
                  </div>
                </div>

                <p className="mt-4 font-body text-sm leading-relaxed text-text-muted">
                  {release.description}
                </p>

                <div className="mt-6 flex flex-wrap gap-2 border-t border-border pt-4">
                  {release.externalLinks.map((link) => (
                    <a
                      key={link.platform}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 border border-border px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-text-muted transition-colors duration-fast hover:border-accent hover:text-accent"
                    >
                      {link.label}
                      <ExternalLink className="h-3 w-3" aria-hidden="true" />
                    </a>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}
