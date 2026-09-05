import React from "react";
import { Container } from "@/components/layout/Container";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { getArtistProfile, getPressAssets, getPressQuotes } from "@/lib/content";
import { Download, FileText, Image as ImageIcon, Music, Quote } from "lucide-react";

export const metadata = {
  title: "Electronic Press Kit (EPK) | DJ Platform",
  description: "Official press kit, biography, technical rider, hospitality requirements, and high-resolution media.",
};

export default function PressPage() {
  const artist = getArtistProfile();
  const assets = getPressAssets();
  const quotes = getPressQuotes();

  return (
    <div className="py-16 sm:py-24">
      <Container>
        {/* Header */}
        <div className="border-b border-border pb-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-xs uppercase tracking-widest text-accent">
              EPK // ELECTRONIC PRESS KIT
            </span>
            <Badge label="2026 OFFICIAL ASSETS" variant="neutral" />
          </div>
          <h1 className="mt-2 font-display text-4xl font-bold uppercase tracking-tight text-text-primary sm:text-6xl">
            Press & Promoters
          </h1>
          <p className="mt-3 font-body text-base text-text-muted max-w-2xl">
            Official promotional assets, high-resolution photography, technical riders, and biography texts for promoters, journalists, and event organizers.
          </p>
        </div>

        {/* Downloadable Assets Grid */}
        <div className="mt-16">
          <div className="flex items-center gap-2 mb-8">
            <span className="h-2 w-2 bg-accent" aria-hidden="true" />
            <h2 className="font-mono text-sm uppercase tracking-widest text-text-primary">
              Downloadable Documents & Packages
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {assets.map((asset) => (
              <div
                key={asset.id}
                className="group flex flex-col justify-between border border-border bg-surface p-6 transition-colors duration-fast hover:border-accent"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-accent">
                      [{asset.fileFormat.toUpperCase()}]
                    </span>
                    {asset.fileSize && (
                      <span className="font-mono text-xs text-text-muted">
                        {asset.fileSize}
                      </span>
                    )}
                  </div>
                  <h3 className="font-display text-lg font-bold uppercase tracking-tight text-text-primary">
                    {asset.title}
                  </h3>
                  <p className="font-body text-xs text-text-muted leading-relaxed">
                    {asset.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-border">
                  <a
                    href={asset.fileUrl}
                    download
                    className="inline-flex w-full items-center justify-center gap-2 border border-border bg-surface-active px-4 py-2 font-mono text-xs uppercase tracking-wider text-text-primary transition-colors duration-fast hover:border-accent hover:text-accent"
                  >
                    Download Asset
                    <Download className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Biography Formats */}
        <div className="mt-20 border-t border-border pt-16">
          <div className="flex items-center gap-2 mb-8">
            <span className="h-2 w-2 bg-text-muted" aria-hidden="true" />
            <h2 className="font-mono text-sm uppercase tracking-widest text-text-primary">
              Approved Biography Text
            </h2>
          </div>

          <div className="space-y-8">
            {/* Short */}
            <div className="border border-border bg-surface p-6">
              <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                <span className="font-mono text-xs font-bold uppercase text-accent">
                  Short Bio (Social / Timetable)
                </span>
                <span className="font-mono text-xs text-text-muted">~25 Words</span>
              </div>
              <p className="font-body text-sm text-text-primary leading-relaxed select-all">
                {artist.shortBio}
              </p>
            </div>

            {/* Medium */}
            <div className="border border-border bg-surface p-6">
              <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                <span className="font-mono text-xs font-bold uppercase text-accent">
                  Medium Bio (Event Program / Website)
                </span>
                <span className="font-mono text-xs text-text-muted">~60 Words</span>
              </div>
              <p className="font-body text-sm text-text-primary leading-relaxed select-all">
                {artist.mediumBio}
              </p>
            </div>

            {/* Long */}
            <div className="border border-border bg-surface p-6">
              <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                <span className="font-mono text-xs font-bold uppercase text-accent">
                  Long Bio (Editorial / Press Feature)
                </span>
                <span className="font-mono text-xs text-text-muted">Extended Editorial</span>
              </div>
              <div className="font-body text-sm text-text-primary leading-relaxed select-all space-y-4 whitespace-pre-line">
                {artist.longBio}
              </div>
            </div>
          </div>
        </div>

        {/* Press Quotes */}
        <div className="mt-20 border-t border-border pt-16">
          <div className="flex items-center gap-2 mb-8">
            <Quote className="h-4 w-4 text-accent" aria-hidden="true" />
            <h2 className="font-mono text-sm uppercase tracking-widest text-text-primary">
              Selected Press Quotes
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {quotes.map((q) => (
              <blockquote
                key={q.id}
                className="border-l-2 border-accent bg-surface p-6 space-y-4"
              >
                <p className="font-body text-sm italic text-text-primary leading-relaxed">
                  &ldquo;{q.quote}&rdquo;
                </p>
                <footer className="font-mono text-xs uppercase text-text-muted">
                  — {q.publication} {q.date && `(${q.date})`}
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}
