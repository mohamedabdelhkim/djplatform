import type { PressAsset, PressQuote } from "@/types/press";

export const pressAssets: readonly PressAsset[] = [
  {
    id: "press-001",
    title: "Official Press Kit (Complete EPK)",
    type: "one-sheet",
    description: "Complete package including hi-res promo photos, logos, biography text, and technical rider.",
    fileUrl: "/assets/press/demo-epk-complete.zip",
    fileFormat: "zip",
    fileSize: "45 MB",
  },
  {
    id: "press-002",
    title: "Technical Rider & Stage Plot (2026)",
    type: "rider-technical",
    description: "Hardware requirements: 3x CDJ-3000, 1x DJM-V10 (or Model 1), 2x Booth Monitors, isolated power.",
    fileUrl: "/assets/press/demo-tech-rider-2026.pdf",
    fileFormat: "pdf",
    fileSize: "1.2 MB",
  },
  {
    id: "press-003",
    title: "Hospitality Rider",
    type: "rider-hospitality",
    description: "Travel requirements, accommodation standards, and green room provisions.",
    fileUrl: "/assets/press/demo-hospitality-rider.pdf",
    fileFormat: "pdf",
    fileSize: "850 KB",
  },
  {
    id: "press-004",
    title: "High-Resolution Press Photos (300 DPI)",
    type: "photo",
    description: "Studio and live performance editorial imagery cleared for promotional and editorial print use.",
    fileUrl: "/assets/press/demo-press-photos.zip",
    fileFormat: "zip",
    fileSize: "32 MB",
  },
  {
    id: "press-005",
    title: "Official Vector Logos & Typography",
    type: "logo",
    description: "Black, white, and accent monochrome vector assets in SVG and EPS formats.",
    fileUrl: "/assets/press/demo-logos-vector.zip",
    fileFormat: "zip",
    fileSize: "4.5 MB",
  },
];

export const pressQuotes: readonly PressQuote[] = [
  {
    id: "quote-001",
    quote: "A masterclass in industrial tension and hypnotic percussion discipline.",
    publication: "Demo Underground Chronicle",
    date: "2026-01",
  },
  {
    id: "quote-002",
    quote: "Uncompromising peak-time energy executed with surgical acoustic precision.",
    publication: "Electronic Resonance Journal",
    date: "2025-11",
  },
  {
    id: "quote-003",
    quote: "Redefining the boundaries of hardware-driven warehouse techno.",
    publication: "Sub-Sonic Review",
    date: "2025-07",
  },
];
