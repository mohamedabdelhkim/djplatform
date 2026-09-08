import { ImageResponse } from "next/og";

// Home-screen icon for iOS. Without it, "Add to Home Screen" saves a screenshot
// of the page instead of a mark, which is unreadable at icon size.
//
// Apple ignores SVG here, so this has to be a raster - generated rather than
// drawn so it cannot drift from src/app/icon.svg.

// `output: export` refuses a route that has not declared itself static. The
// image is built once at export time and served as a file, which is exactly
// what is wanted here - there is nothing per-request about it.
export const dynamic = "force-static";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Kept well inside the frame on purpose. iOS masks this to a rounded square,
// and bars sized to the full canvas lose their ends to the corner radius.
const BARS = [48, 80, 104, 64, 40];

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 9,
          background: "#08080a",
        }}
      >
        {BARS.map((height, i) => (
          <div key={i} style={{ width: 14, height, background: "#ccff00" }} />
        ))}
      </div>
    ),
    { ...size }
  );
}
