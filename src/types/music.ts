export type ReleaseType = "EP" | "LP" | "Single" | "Remix" | "Compilation";

export type MusicPlatform =
  | "bandcamp"
  | "spotify"
  | "apple-music"
  | "beatport"
  | "soundcloud"
  | "vinyl";

export interface PlatformLink {
  readonly platform: MusicPlatform;
  readonly url: string;
  readonly label: string;
}

export interface MusicRelease {
  readonly id: string;
  readonly title: string;
  readonly type: ReleaseType;
  readonly releaseDate: string; // ISO date format: YYYY-MM-DD
  readonly label: string;
  readonly catalogNumber?: string;
  readonly artwork: string;
  readonly description: string;
  readonly externalLinks: readonly PlatformLink[];
  readonly featured: boolean;
}

export type MixPlatform = "soundcloud" | "youtube" | "mixcloud" | "spotify";

export interface MixTrack {
  readonly id: string;
  readonly title: string;
  readonly date: string; // ISO date format: YYYY-MM-DD
  readonly duration: string; // MM:SS or HH:MM:SS
  readonly platform: MixPlatform;
  readonly embedUrl: string;
  readonly artwork: string;
  readonly description: string;
  readonly tracklist?: readonly string[];
  readonly featured: boolean;
}
