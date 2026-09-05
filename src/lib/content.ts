import { artistConfig } from "@/config/artist";
import { musicReleases, mixTracks } from "@/config/music";
import { tourEvents } from "@/config/events";
import { galleryImages } from "@/config/gallery";
import { pressAssets, pressQuotes } from "@/config/press";
import { siteConfig } from "@/config/site";

import type { ArtistProfile } from "@/types/artist";
import type { MusicRelease, MixTrack } from "@/types/music";
import type { TourEvent, EventTimeframe } from "@/types/events";
import type { GalleryImage, GalleryCategory } from "@/types/gallery";
import type { PressAsset, PressQuote } from "@/types/press";
import type { SiteConfig } from "@/config/site";

/**
 * Decoupled Content Query Layer
 *
 * UI components consume these query functions rather than importing static config files directly.
 * In a future phase, these implementations can query a headless CMS or database without altering
 * any UI component contracts.
 */

export function getSiteConfig(): SiteConfig {
  return siteConfig;
}

export function getArtistProfile(): ArtistProfile {
  return artistConfig;
}

export function getAllReleases(): readonly MusicRelease[] {
  return musicReleases;
}

export function getFeaturedReleases(): readonly MusicRelease[] {
  return musicReleases.filter((release) => release.featured);
}

export function getAllMixes(): readonly MixTrack[] {
  return mixTracks;
}

export function getFeaturedMixes(): readonly MixTrack[] {
  return mixTracks.filter((mix) => mix.featured);
}

export function getEventsByTimeframe(timeframe: EventTimeframe): readonly TourEvent[] {
  return tourEvents.filter((event) => event.timeframe === timeframe);
}

export function getUpcomingEvents(): readonly TourEvent[] {
  return getEventsByTimeframe("upcoming");
}

export function getPastEvents(): readonly TourEvent[] {
  return getEventsByTimeframe("past");
}

export function getAllGalleryImages(): readonly GalleryImage[] {
  return galleryImages;
}

export function getGalleryByCategory(category: GalleryCategory): readonly GalleryImage[] {
  return galleryImages.filter((img) => img.category === category);
}

export function getFeaturedGalleryImages(): readonly GalleryImage[] {
  return galleryImages.filter((img) => img.priority);
}

export function getPressAssets(): readonly PressAsset[] {
  return pressAssets;
}

export function getPressQuotes(): readonly PressQuote[] {
  return pressQuotes;
}
