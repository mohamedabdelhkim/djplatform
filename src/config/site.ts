export interface NavItem {
  readonly label: string;
  readonly href: string;
}

export interface SiteConfig {
  readonly name: string;
  readonly tagline: string;
  readonly description: string;
  readonly url: string;
  readonly contactEmail: string;
  readonly navItems: readonly NavItem[];
  readonly footerText: string;
}

export const siteConfig: SiteConfig = {
  name: "DEMO ARTIST",
  tagline: "Underground Electronic Music & Performance",
  description:
    "Official portfolio, tour calendar, sound archive, and EPK booking platform for DEMO ARTIST.",
  url: "https://example.com",
  contactEmail: "demo@example.com",
  navItems: [
    { label: "About", href: "/#about" },
    { label: "Music", href: "/music" },
    { label: "Events", href: "/events" },
    { label: "Press", href: "/press" },
    { label: "Booking", href: "/#booking" },
  ],
  footerText: "© 2026 DEMO ARTIST. ALL RIGHTS RESERVED. DEMO SPECIFICATION.",
};
