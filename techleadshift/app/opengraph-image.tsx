import { ImageResponse } from "next/og";

export const alt = "Tech Lead Shift — Charles Betancourt";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function Image() {
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
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              color: "#b8860b",
              fontSize: 22,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
            }}
          >
            <div style={{ width: 48, height: 1, background: "#b8860b" }} />
            Tech Lead Shift
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              maxWidth: "900px",
            }}
          >
            <div style={{ fontSize: 68, lineHeight: 1.05 }}>
              The first AI leadership crisis
            </div>
            <div style={{ fontSize: 68, lineHeight: 1.05 }}>
              won&apos;t be technical.
            </div>
            <div style={{ fontSize: 68, lineHeight: 1.05, color: "#2e5f8a" }}>
              It will be cultural.
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            gap: "24px",
          }}
        >
          <div
            style={{
              maxWidth: "760px",
              color: "#4a4a46",
              fontSize: 28,
              lineHeight: 1.4,
            }}
          >
            Research-backed writing on leadership, AI, and the humans caught in between.
          </div>
          <div
            style={{
              color: "#1a3a5c",
              fontSize: 28,
            }}
          >
            Charles Betancourt
          </div>
        </div>
      </div>
    ),
    size
  );
}
