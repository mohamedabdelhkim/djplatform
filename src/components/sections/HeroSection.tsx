import React from "react";
import Link from "next/link";
import { Container } from "../layout/Container";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { getArtistProfile } from "@/lib/content";
import { ArrowUpRight } from "lucide-react";

export function HeroSection() {
  const artist = getArtistProfile();

  return (
    <section className="relative border-b border-border bg-background pt-24 pb-16 sm:pt-32 sm:pb-24">
      {/* Brutalist structural background grid line */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#222227_1px,transparent_1px),linear-gradient(to_bottom,#222227_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />

      <Container className="relative z-10">
        <div className="max-w-4xl space-y-8">
          {/* Live Signal Status */}
          <div className="flex flex-wrap items-center gap-3">
            <Badge
              label={`STATUS: ${artist.status}`}
              variant="signal"
              showDot
            />
            <span className="font-mono text-xs uppercase tracking-widest text-text-muted">
              [{artist.location}]
            </span>
          </div>

          {/* Editorial Display Heading */}
          <div className="space-y-4">
            <h1 className="font-display text-5xl font-bold uppercase tracking-tight text-text-primary sm:text-7xl lg:text-8xl">
              {artist.name}
            </h1>
            <p className="font-mono text-sm uppercase tracking-widest text-accent">
              {artist.genres.join(" // ")}
            </p>
          </div>

          {/* Artist Statement / Bio */}
          <p className="max-w-2xl font-body text-base text-text-muted sm:text-lg leading-relaxed">
            {artist.shortBio}
          </p>

          {/* Action Triggers */}
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Link href="/#booking" tabIndex={-1}>
              <Button variant="primary" size="lg">
                Book Artist
                <ArrowUpRight className="ml-1.5 h-4 w-4" aria-hidden="true" />
              </Button>
            </Link>

            <Link href="/press" tabIndex={-1}>
              <Button variant="secondary" size="lg">
                Electronic Press Kit
              </Button>
            </Link>

            <Link href="/music" tabIndex={-1}>
              <Button variant="outline" size="lg">
                Sound Archive
              </Button>
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
