import { ImageResponse } from "next/og";
import { getSiteConfig, getArtistProfile } from "@/lib/content";

// The card a promoter actually sees first. An EPK link gets pasted into
// WhatsApp, Instagram DMs and email long before anyone opens the site, and with
// no image declared those all render a blank grey box - the worst possible first
// impression for a booking pitch.
//
// Generated from the content layer rather than drawn, so replacing DEMO ARTIST
// updates this card in the same commit. A hand-made PNG would quietly keep
// showing the placeholder name forever.

// `output: export` refuses a route that has not declared itself static. The
// image is built once at export time and served as a file, which is exactly
// what is wanted here - there is nothing per-request about it.
export const dynamic = "force-static";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Electronic press kit and booking";

// Mirrors src/app/icon.svg. Satori supports a narrow subset of CSS, so the bars
// are plain flex children rather than the SVG the tab icon uses.
const BARS = [56, 96, 128, 76, 44];

export default function OpengraphImage() {
  const site = getSiteConfig();
  const artist = getArtistProfile();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#08080a",
          padding: "72px 80px",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 128 }}>
          {BARS.map((height, i) => (
            <div key={i} style={{ width: 20, height, background: "#ccff00" }} />
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 128,
              fontWeight: 700,
              color: "#f2f2f5",
              letterSpacing: "-0.03em",
              lineHeight: 1,
            }}
          >
            {artist.name}
          </div>
          <div style={{ fontSize: 40, color: "#ccff00", marginTop: 28 }}>{site.tagline}</div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div style={{ fontSize: 26, color: "#8a8a94" }}>
            {artist.genres.slice(0, 4).join("  ·  ")}
          </div>
          <div style={{ fontSize: 26, color: "#8a8a94" }}>{site.url.replace("https://", "")}</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
