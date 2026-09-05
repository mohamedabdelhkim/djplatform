export type SocialPlatform =
  | "soundcloud"
  | "spotify"
  | "bandcamp"
  | "instagram"
  | "resident-advisor"
  | "youtube"
  | "x";

export interface SocialLink {
  readonly platform: SocialPlatform;
  readonly url: string;
  readonly label: string;
}

export type ArtistStatus = "touring" | "studio" | "available" | "offline";

export type BookingAvailability = "available" | "limited" | "closed";

export interface ArtistProfile {
  readonly name: string;
  readonly location: string;
  readonly genres: readonly string[];
  readonly shortBio: string;
  readonly mediumBio: string;
  readonly longBio: string;
  readonly status: ArtistStatus;
  readonly bookingAvailability: BookingAvailability;
  readonly socialLinks: readonly SocialLink[];
}
