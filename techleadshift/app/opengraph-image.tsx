import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Tech Lead Shift: Manage the machine, not the sentiment";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

// The OG renderer needs font files it can read (woff, not woff2). They come from
// @fontsource so the card uses the same DM Serif Display and DM Sans as the site,
// not the renderer's default sans.
async function font(pkg: string, file: string) {
  return readFile(path.join(process.cwd(), "node_modules", "@fontsource", pkg, "files", file));
}

export default async function Image() {
  const [serif, sans] = await Promise.all([
    font("dm-serif-display", "dm-serif-display-latin-400-normal.woff"),
    font("dm-sans", "dm-sans-latin-400-normal.woff"),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#f7f5f0",
          color: "#0f0f0e",
          padding: "68px 72px",
          border: "1px solid #d4d0c8",
          fontFamily: "DM Sans",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              color: "#7a5600",
              fontSize: 22,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
            }}
          >
            <div style={{ width: 48, height: 2, background: "#b8860b" }} />
            Tech Lead Shift
          </div>
          <div style={{ display: "flex", flexDirection: "column", fontFamily: "DM Serif Display", fontSize: 96, lineHeight: 1.04 }}>
            <div>Manage the machine,</div>
            <div>not the sentiment.</div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            gap: "24px",
            color: "#4a4a46",
            fontSize: 28,
          }}
        >
          <div>New articles twice a month, on Wednesdays.</div>
          <div style={{ color: "#1a3a5c" }}>Charles Betancourt</div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "DM Serif Display", data: serif, style: "normal", weight: 400 },
        { name: "DM Sans", data: sans, style: "normal", weight: 400 },
      ],
    }
  );
}
