import type { Metadata, Viewport } from "next";
import { getSiteConfig } from "@/lib/content";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

// metadataBase is what makes the rest of this work. Open Graph consumers need
// absolute URLs, and without a base Next emits relative ones - so the card that
// looks correct in a local preview arrives in WhatsApp with no image at all.
// The value is read from the content layer so the domain is stated in exactly
// one place.
const site = getSiteConfig();

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: site.name + " | EPK & Booking",
  description: site.description,
  openGraph: {
    type: "website",
    url: site.url,
    siteName: site.name,
    title: site.name + " | EPK & Booking",
    description: site.description,
  },
  twitter: {
    // summary_large_image is the difference between a thumbnail beside the text
    // and a full-width card. For an EPK the image is the pitch.
    card: "summary_large_image",
    title: site.name + " | EPK & Booking",
    description: site.description,
  },
};

// Tints the browser chrome on mobile to the site background, so the page does
// not sit inside a white bar it was never designed against.
export const viewport: Viewport = {
  themeColor: "#08080a",
};

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen flex flex-col bg-background font-body text-text-primary antialiased selection:bg-accent selection:text-background">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
