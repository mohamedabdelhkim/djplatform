import type { ArtistProfile } from "@/types/artist";

export const artistConfig: ArtistProfile = {
  name: "DEMO ARTIST",
  location: "Demo Metropolis, DE",
  genres: ["Techno", "Industrial", "EBM", "Modular Electronic"],
  shortBio:
    "DEMO ARTIST is an underground electronic music producer and live performer crafting hypnotic, industrial-infused soundscapes.",
  mediumBio:
    "Born from warehouse acoustics and modular hardware experimentation, DEMO ARTIST combines raw percussion textures with dark harmonic tension. Performing across premier underground spaces worldwide, every set is structured as an uncompromising kinetic journey.",
  longBio:
    "DEMO ARTIST explores the intersection between raw mechanical rhythm and spatial darkness. Beginning in modular sound laboratories and club residencies across Europe, the project has evolved into a disciplined sonic identity known for surgical precision, analog warmth, and intense physical impact.\n\nWith releases on respected underground cassette and vinyl imprints, DEMO ARTIST approaches each venue as an acoustic laboratory, tuning heavy kick drums, harsh synthesis, and psychoacoustic frequencies to the architecture of the space.",
  status: "touring",
  bookingAvailability: "available",
  socialLinks: [
    {
      platform: "soundcloud",
      url: "https://example.com/demo-artist/soundcloud",
      label: "SoundCloud",
    },
    {
      platform: "bandcamp",
      url: "https://example.com/demo-artist/bandcamp",
      label: "Bandcamp",
    },
    {
      platform: "resident-advisor",
      url: "https://example.com/demo-artist/resident-advisor",
      label: "Resident Advisor",
    },
    {
      platform: "spotify",
      url: "https://example.com/demo-artist/spotify",
      label: "Spotify",
    },
    {
      platform: "instagram",
      url: "https://example.com/demo-artist/instagram",
      label: "Instagram",
    },
    {
      platform: "youtube",
      url: "https://example.com/demo-artist/youtube",
      label: "YouTube",
    },
  ],
};

export const artist = {
  ...artistConfig,
  bio: artistConfig.shortBio,
};
