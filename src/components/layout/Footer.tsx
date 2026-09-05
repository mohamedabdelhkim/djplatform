import React from "react";
import Link from "next/link";
import { Container } from "./Container";
import { getSiteConfig, getArtistProfile } from "@/lib/content";

export function Footer() {
  const site = getSiteConfig();
  const artist = getArtistProfile();

  return (
    <footer className="border-t border-border bg-background py-12">
      <Container>
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div>
            <span className="font-display text-base font-bold uppercase tracking-tight text-text-primary">
              {site.name}
            </span>
            <p className="mt-1 font-mono text-xs text-text-muted">
              {site.footerText}
            </p>
          </div>

          {/* Social Links */}
          <div className="flex flex-wrap items-center gap-4">
            {artist.socialLinks.map((link) => (
              <a
                key={link.platform}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs uppercase tracking-wider text-text-muted hover:text-accent transition-colors duration-fast"
              >
                [{link.label}]
              </a>
            ))}
          </div>
        </div>
      </Container>
    </footer>
  );
}
