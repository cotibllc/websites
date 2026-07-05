import { ImageResponse } from "next/og";

export const alt = "The IT XP — A podcast for IT professionals";
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
          background: "#0D1724",
          color: "#FFFFFF",
          padding: "68px 72px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            color: "#F5A623",
            fontSize: 22,
            letterSpacing: "0.24em",
            textTransform: "uppercase",
          }}
        >
          <div style={{ width: 48, height: 2, background: "#F5A623" }} />
          Podcast
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div
            style={{
              display: "flex",
              fontSize: 120,
              fontWeight: 700,
              lineHeight: 1,
              letterSpacing: "-0.02em",
              textTransform: "uppercase",
            }}
          >
            THE IT&nbsp;
            <span style={{ color: "#F5A623" }}>XP</span>
          </div>
          <div
            style={{
              maxWidth: "880px",
              color: "#8A9BB0",
              fontSize: 30,
              lineHeight: 1.4,
            }}
          >
            Pulling back the curtain on what it&apos;s really like to work in
            Information Technology.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            color: "#8A9BB0",
            fontSize: 24,
          }}
        >
          <div style={{ display: "flex" }}>theitxp.com</div>
          <div style={{ display: "flex", color: "#1B7FFF" }}>
            Hosted by Chuck Betancourt
          </div>
        </div>
      </div>
    ),
    size
  );
}
