import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Corporate Hardcore — Observational satire for the corporate lifer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#1a1a1a",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "80px",
        }}
      >
        <div
          style={{
            color: "#991b1b",
            fontSize: 18,
            fontWeight: 700,
            marginBottom: 28,
            textTransform: "uppercase",
            letterSpacing: 6,
          }}
        >
          Corporate Hardcore
        </div>
        <div
          style={{
            color: "#ffffff",
            fontSize: 54,
            fontWeight: 700,
            lineHeight: 1.2,
            maxWidth: 900,
          }}
        >
          Observational satire for the corporate lifer.
        </div>
        <div
          style={{
            color: "#6b7280",
            fontSize: 24,
            marginTop: 40,
            fontStyle: "italic",
          }}
        >
          Circle Back. Never Return.
        </div>
      </div>
    ),
    { ...size }
  );
}
