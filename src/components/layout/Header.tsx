import React from "react";
import Link from "next/link";
import { Container } from "./Container";
import { getSiteConfig, getArtistProfile } from "@/lib/content";
import { Badge } from "@/components/ui/Badge";

export function Header() {
  const site = getSiteConfig();
  const artist = getArtistProfile();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/90 backdrop-blur-sm">
      <Container>
        <div className="flex h-16 items-center justify-between">
          {/* Logo / Artist Name */}
          <Link
            href="/"
            className="flex items-center gap-3 font-display text-lg font-bold uppercase tracking-tight text-text-primary hover:text-accent transition-colors duration-fast"
          >
            <span>{site.name}</span>
            <Badge label={artist.status} variant="signal" showDot />
          </Link>

          {/* Navigation Links */}
          <nav className="flex items-center gap-6" aria-label="Main Navigation">
            {site.navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="font-mono text-xs uppercase tracking-wider text-text-muted hover:text-text-primary transition-colors duration-fast focus-visible:outline-2 focus-visible:outline-accent"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </Container>
    </header>
  );
}
