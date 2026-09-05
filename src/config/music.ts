import type { MusicRelease, MixTrack } from "@/types/music";

export const musicReleases: readonly MusicRelease[] = [
  {
    id: "rel-001",
    title: "FREQUENCY PROTOCOL EP",
    type: "EP",
    releaseDate: "2026-03-15",
    label: "Demo Records Underground",
    catalogNumber: "DRU-042",
    artwork: "/images/releases/demo-release-1.jpg",
    description:
      "Four original cuts of stripped-down warehouse industrial techno featuring metallic percussive sequences and sub-bass modulations.",
    externalLinks: [
      { platform: "bandcamp", url: "https://example.com/releases/demo-ep-1/bandcamp", label: "Bandcamp" },
      { platform: "spotify", url: "https://example.com/releases/demo-ep-1/spotify", label: "Spotify" },
      { platform: "beatport", url: "https://example.com/releases/demo-ep-1/beatport", label: "Beatport" },
      { platform: "vinyl", url: "https://example.com/releases/demo-ep-1/vinyl", label: "12\" Vinyl" },
    ],
    featured: true,
  },
  {
    id: "rel-002",
    title: "CONCRETE SIGNAL LP",
    type: "LP",
    releaseDate: "2025-11-20",
    label: "Demo Audio Collective",
    catalogNumber: "DAC-LP08",
    artwork: "/images/releases/demo-release-2.jpg",
    description:
      "Debut double-gatefold vinyl LP documenting extended analog modular jam sessions recorded during late-night warehouse sessions.",
    externalLinks: [
      { platform: "bandcamp", url: "https://example.com/releases/demo-lp-1/bandcamp", label: "Bandcamp" },
      { platform: "spotify", url: "https://example.com/releases/demo-lp-1/spotify", label: "Spotify" },
      { platform: "apple-music", url: "https://example.com/releases/demo-lp-1/apple", label: "Apple Music" },
    ],
    featured: true,
  },
  {
    id: "rel-003",
    title: "KINETIC COLLAPSE",
    type: "Single",
    releaseDate: "2025-06-10",
    label: "Demo Imprint Berlin",
    catalogNumber: "DIB-019",
    artwork: "/images/releases/demo-release-3.jpg",
    description:
      "A 140 BPM peak-time weapon driven by distorted 909 percussion and harsh sync-lead modulations.",
    externalLinks: [
      { platform: "bandcamp", url: "https://example.com/releases/demo-single-1/bandcamp", label: "Bandcamp" },
      { platform: "soundcloud", url: "https://example.com/releases/demo-single-1/soundcloud", label: "SoundCloud" },
    ],
    featured: false,
  },
  {
    id: "rel-004",
    title: "ANOMALY RESTRUCTURED (REMIX)",
    type: "Remix",
    releaseDate: "2025-02-04",
    label: "Demo Records Sound Lab",
    catalogNumber: "DRSL-REM03",
    artwork: "/images/releases/demo-release-4.jpg",
    description:
      "A deconstructed rework of demo pioneer stems into a relentless rhythm exploration.",
    externalLinks: [
      { platform: "beatport", url: "https://example.com/releases/demo-remix-1/beatport", label: "Beatport" },
      { platform: "spotify", url: "https://example.com/releases/demo-remix-1/spotify", label: "Spotify" },
    ],
    featured: false,
  },
];

export const mixTracks: readonly MixTrack[] = [
  {
    id: "mix-001",
    title: "LIVE AT DEMO CLUB VAULT",
    date: "2026-02-14",
    duration: "68:42",
    platform: "soundcloud",
    embedUrl: "https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/demo-mix-1",
    artwork: "/images/mixes/demo-mix-1.jpg",
    description:
      "Recorded live on the main room soundsystem at Demo Club Vault. Unreleased dubplates and modular hardware improvisations.",
    tracklist: [
      "DEMO ARTIST - Intro Drone",
      "Demo Producer A - Unreleased Track (Demo Dub)",
      "DEMO ARTIST - Frequency Protocol",
      "Demo Producer B - Raw Modulations",
      "DEMO ARTIST - Concrete Signal (Live Re-edit)",
    ],
    featured: true,
  },
  {
    id: "mix-002",
    title: "DEMO RADIO EPISODE 042",
    date: "2025-12-05",
    duration: "59:30",
    platform: "soundcloud",
    embedUrl: "https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/demo-mix-2",
    artwork: "/images/mixes/demo-mix-2.jpg",
    description:
      "Monthly guest mix exploration featuring deep hypnotic grooves, contemporary EBM, and ambient interludes.",
    featured: true,
  },
  {
    id: "mix-003",
    title: "SUB-TERRAIN SESSIONS #12",
    date: "2025-08-19",
    duration: "74:15",
    platform: "soundcloud",
    embedUrl: "https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/demo-mix-3",
    artwork: "/images/mixes/demo-mix-3.jpg",
    description:
      "Deep warehouse vinyl-only selection capturing dark room energy and continuous atmospheric momentum.",
    featured: false,
  },
];
