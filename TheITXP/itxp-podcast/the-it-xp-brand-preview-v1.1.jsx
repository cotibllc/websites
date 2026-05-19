import { useState } from "react";

const C = {
  navy: "#0D1724",
  blue: "#1B7FFF",
  amber: "#F5A623",
  white: "#FFFFFF",
  steel: "#8A9BB0",
  slate: "#162032",
};

const font = "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;600&family=IBM+Plex+Sans+Condensed:wght@700&family=IBM+Plex+Mono&display=swap";

const tabs = ["overview", "colors", "type", "logo", "assets", "usage"];

export default function BrandPreview() {
  const [tab, setTab] = useState("overview");

  return (
    <>
      <style>{`
        @import url('${font}');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .w {
          background: ${C.navy};
          min-height: 100vh;
          font-family: 'IBM Plex Sans', sans-serif;
          color: ${C.white};
          padding: 28px 20px;
          max-width: 880px;
          margin: 0 auto;
        }
        .eyebrow {
          font-size: 10px;
          letter-spacing: 0.18em;
          color: ${C.steel};
          text-transform: uppercase;
          margin-bottom: 6px;
        }
        .wordmark {
          font-family: 'IBM Plex Sans Condensed', sans-serif;
          font-weight: 700;
          font-size: 44px;
          letter-spacing: -0.02em;
          line-height: 1;
          margin-bottom: 8px;
        }
        .wordmark .xp { color: ${C.amber}; }
        .version-tag {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 10px;
          color: ${C.blue};
          margin-bottom: 28px;
        }
        .tabs {
          display: flex;
          gap: 2px;
          margin-bottom: 28px;
          border-bottom: 1px solid ${C.slate};
          overflow-x: auto;
        }
        .tb {
          background: none;
          border: none;
          color: ${C.steel};
          font-family: 'IBM Plex Sans', sans-serif;
          font-size: 11px;
          padding: 8px 14px 12px;
          cursor: pointer;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          position: relative;
          white-space: nowrap;
          transition: color 0.15s;
          flex-shrink: 0;
        }
        .tb:hover { color: ${C.white}; }
        .tb.on { color: ${C.amber}; }
        .tb.on::after {
          content: '';
          position: absolute;
          bottom: -1px; left: 0; right: 0;
          height: 2px;
          background: ${C.amber};
        }
        .lbl {
          font-size: 10px;
          letter-spacing: 0.14em;
          color: ${C.steel};
          text-transform: uppercase;
          margin-bottom: 12px;
          margin-top: 28px;
        }
        .lbl:first-child { margin-top: 0; }
        .color-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(128px, 1fr));
          gap: 10px;
        }
        .swatch { border-radius: 3px; overflow: hidden; }
        .swatch-block { height: 72px; }
        .swatch-info { background: ${C.slate}; padding: 9px 11px; }
        .swatch-name { font-size: 11px; font-weight: 600; margin-bottom: 2px; }
        .swatch-hex { font-family: 'IBM Plex Mono', monospace; font-size: 10px; color: ${C.steel}; }
        .swatch-role { font-size: 9px; color: ${C.steel}; margin-top: 3px; line-height: 1.4; }
        .ts { background: ${C.slate}; border-radius: 3px; padding: 18px 20px; margin-bottom: 10px; }
        .ts-meta { font-size: 9px; letter-spacing: 0.1em; color: ${C.steel}; text-transform: uppercase; margin-bottom: 8px; }
        .logo-wrap {
          border: 1px solid ${C.slate};
          border-radius: 3px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 44px;
          margin-bottom: 10px;
        }
        .lg {
          font-family: 'IBM Plex Sans Condensed', sans-serif;
          font-weight: 700;
          font-size: 56px;
          letter-spacing: -0.02em;
          line-height: 1;
        }
        .lg .xp { color: ${C.amber}; }
        .cover {
          width: 180px;
          height: 180px;
          background: ${C.navy};
          border: 1px solid ${C.slate};
          border-radius: 6px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 7px;
          padding: 20px;
          flex-shrink: 0;
        }
        .cover-wm {
          font-family: 'IBM Plex Sans Condensed', sans-serif;
          font-weight: 700;
          font-size: 24px;
          letter-spacing: -0.02em;
          line-height: 1;
          text-align: center;
        }
        .cover-wm .xp { color: ${C.amber}; }
        .cover-rule { width: 80%; height: 1px; background: ${C.blue}; }
        .cover-sub { font-size: 7px; letter-spacing: 0.12em; color: ${C.steel}; text-transform: uppercase; text-align: center; }
        .asset-grid { display: flex; gap: 12px; flex-wrap: wrap; align-items: flex-start; }
        .asset-card {
          background: ${C.slate};
          border-radius: 3px;
          overflow: hidden;
          width: 220px;
        }
        .asset-img { width: 100%; height: 130px; object-fit: cover; }
        .asset-body { padding: 12px 14px; }
        .asset-verdict {
          font-size: 9px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-bottom: 5px;
          font-weight: 600;
        }
        .verdict-retire { color: #FF6B6B; }
        .verdict-anchor { color: ${C.amber}; }
        .verdict-update { color: ${C.steel}; }
        .asset-note { font-size: 11px; color: ${C.steel}; line-height: 1.5; }
        .ep-card {
          background: ${C.slate};
          border-radius: 3px;
          padding: 14px;
          width: 200px;
        }
        .ep-num {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 9px;
          color: ${C.amber};
          margin-bottom: 5px;
          letter-spacing: 0.1em;
        }
        .ep-title {
          font-family: 'IBM Plex Sans Condensed', sans-serif;
          font-weight: 700;
          font-size: 15px;
          line-height: 1.2;
        }
        .ep-title .hl { color: ${C.amber}; }
        .pq {
          background: ${C.slate};
          border-left: 3px solid ${C.amber};
          padding: 14px 18px;
          border-radius: 0 3px 3px 0;
          margin-top: 8px;
        }
        .pq p {
          font-family: 'IBM Plex Sans Condensed', sans-serif;
          font-weight: 700;
          font-size: 17px;
          line-height: 1.3;
        }
        .pq cite { font-size: 10px; color: ${C.steel}; margin-top: 6px; display: block; font-style: normal; }
        .row { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 8px; }
        .note { font-size: 11px; color: ${C.steel}; line-height: 1.5; margin-top: 8px; }
        .pill {
          display: inline-block;
          padding: 3px 10px;
          border-radius: 2px;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          background: ${C.amber};
          color: ${C.navy};
          margin-left: 10px;
        }
        .tl-row { display: flex; flex-direction: column; gap: 7px; }
        .tl {
          background: ${C.slate};
          border-radius: 3px;
          padding: 12px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .tl-text {
          font-family: 'IBM Plex Sans Condensed', sans-serif;
          font-weight: 700;
          font-size: 17px;
        }
        .divider { height: 1px; background: ${C.slate}; margin: 20px 0; }
        .changed {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 9px;
          background: ${C.slate};
          color: ${C.blue};
          padding: 2px 8px;
          border-radius: 2px;
          display: inline-block;
          margin-left: 8px;
        }
      `}</style>

      <div className="w">
        <div className="eyebrow">Brand Style Guide</div>
        <div className="wordmark">THE IT <span className="xp">XP</span></div>
        <div className="version-tag">V1.1 / UPDATED AFTER ASSET REVIEW</div>

        <div className="tabs">
          {tabs.map(t => (
            <button key={t} className={`tb${tab === t ? " on" : ""}`} onClick={() => setTab(t)}>{t}</button>
          ))}
        </div>

        {tab === "overview" && (
          <div>
            <div className="lbl">Positioning</div>
            <div className="pq">
              <p>Experienced IT professionals become more valuable with AI. Not obsolete.</p>
              <cite>Core thesis, The IT XP</cite>
            </div>

            <div className="lbl">Recommended Tagline</div>
            <div className="tl-row">
              <div className="tl"><span className="tl-text">Real IT. No filler.</span><span className="pill">Recommended</span></div>
              <div className="tl"><span className="tl-text">Twenty-five years in. Still learning.</span></div>
              <div className="tl"><span className="tl-text">The podcast for IT pros who have been around.</span></div>
            </div>

            <div className="lbl">Voice</div>
            <div className="ts">
              <div style={{ fontFamily: "'IBM Plex Sans Condensed'", fontWeight: 700, fontSize: 18, lineHeight: 1.4 }}>
                Earned. Direct. Unfiltered. Specific.
              </div>
              <div className="note">The voice of someone who has seen the hype cycles, survived the reorgs, shipped the migrations, and still shows up.</div>
            </div>
          </div>
        )}

        {tab === "colors" && (
          <div>
            <div className="lbl">Color System <span className="changed">updated from asset review</span></div>
            <div className="color-grid">
              {[
                { name: "Deep Navy", hex: C.navy, role: "Primary backgrounds" },
                { name: "Electric Blue", hex: C.blue, role: "Secondary accents, borders, active states" },
                { name: "Amber Gold", hex: C.amber, role: "CTAs, highlights, pull quotes" },
                { name: "White", hex: C.white, role: "Body text on dark" },
                { name: "Steel", hex: C.steel, role: "Secondary text, captions" },
                { name: "Dark Slate", hex: C.slate, role: "Cards, section panels" },
              ].map(c => (
                <div className="swatch" key={c.name}>
                  <div className="swatch-block" style={{ background: c.hex, border: c.hex === C.white ? `1px solid ${C.slate}` : "none" }} />
                  <div className="swatch-info">
                    <div className="swatch-name">{c.name}</div>
                    <div className="swatch-hex">{c.hex}</div>
                    <div className="swatch-role">{c.role}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="note" style={{ marginTop: 14 }}>
              Deep navy and electric blue sourced directly from existing assets. Amber gold appears in the circuit board image as the chip trace color. Purple (from the warrior character) is retired.
            </div>
          </div>
        )}

        {tab === "type" && (
          <div>
            <div className="lbl">IBM Plex Sans Family</div>
            <div className="ts">
              <div className="ts-meta">Display / IBM Plex Sans Condensed Bold</div>
              <div style={{ fontFamily: "'IBM Plex Sans Condensed'", fontWeight: 700, fontSize: 32, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
                AI Didn't Take Your Job.<br />Your Lack of Judgment Might.
              </div>
            </div>
            <div className="ts">
              <div className="ts-meta">Heading / IBM Plex Sans SemiBold</div>
              <div style={{ fontFamily: "'IBM Plex Sans'", fontWeight: 600, fontSize: 19 }}>Season 12: My Full AI Stack</div>
            </div>
            <div className="ts">
              <div className="ts-meta">Body / IBM Plex Sans Regular</div>
              <div style={{ fontFamily: "'IBM Plex Sans'", fontWeight: 400, fontSize: 14, lineHeight: 1.65, color: C.white }}>
                The IT XP covers AI tools, career strategy, and what is actually happening in the field. Not the vendor version. Hosted by Chuck, 25+ years in IT infrastructure.
              </div>
            </div>
            <div className="ts">
              <div className="ts-meta">Mono / IBM Plex Mono (stats, episode numbers, timestamps)</div>
              <div style={{ fontFamily: "'IBM Plex Mono'", fontSize: 12, color: C.amber }}>
                EP. 140 / SEASON 12 / 00:47:22
              </div>
            </div>
          </div>
        )}

        {tab === "logo" && (
          <div>
            <div className="lbl">Primary Wordmark (Dark)</div>
            <div className="logo-wrap" style={{ background: C.navy }}>
              <div className="lg">THE IT <span className="xp">XP</span></div>
            </div>
            <div className="lbl">Reversed (Light Background)</div>
            <div className="logo-wrap" style={{ background: C.white }}>
              <div className="lg" style={{ color: C.navy }}>THE IT <span className="xp">XP</span></div>
            </div>
            <div className="lbl">Cover Art Mockup</div>
            <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
              <div className="cover">
                <div className="cover-wm">THE IT <span className="xp">XP</span></div>
                <div className="cover-rule" />
                <div className="cover-sub">Podcast for IT Professionals</div>
              </div>
              <div className="note" style={{ maxWidth: 260, paddingTop: 4 }}>
                Cover art uses wordmark only. No photography. The electric blue rule creates a connection to the existing color system without using the circuit board image directly.<br /><br />
                Name format: "THE IT XP" without periods. Cleaner at all sizes. Use "The I.T. XP" only where the acronym needs spelling out.
              </div>
            </div>
          </div>
        )}

        {tab === "assets" && (
          <div>
            <div className="lbl">Asset Decisions</div>
            <div className="asset-grid">
              <div className="asset-card">
                <div style={{ background: C.slate, height: 130, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: C.steel, padding: 12, textAlign: "center" }}>
                  Warrior Character<br />(Image 1)
                </div>
                <div className="asset-body">
                  <div className="asset-verdict verdict-retire">Retire from primary use</div>
                  <div className="asset-note">Gaming/cyberpunk aesthetic creates a gap with the practitioner positioning. Keep for limited promotional use only.</div>
                </div>
              </div>
              <div className="asset-card">
                <div style={{ background: C.slate, height: 130, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: C.steel, padding: 12, textAlign: "center" }}>
                  3D Wordmark<br />(Image 2)
                </div>
                <div className="asset-body">
                  <div className="asset-verdict verdict-update">Update / Retire 3D treatment</div>
                  <div className="asset-note">Color direction (navy to blue) is correct. The 3D isometric treatment feels dated. Replace with flat wordmark.</div>
                </div>
              </div>
              <div className="asset-card">
                <div style={{ background: C.slate, height: 130, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: C.amber, padding: 12, textAlign: "center", fontWeight: 600 }}>
                  Circuit Board<br />(Image 3)
                </div>
                <div className="asset-body">
                  <div className="asset-verdict verdict-anchor">Anchor visual</div>
                  <div className="asset-note">Strongest asset. Cinematic, technical, communicates infrastructure. Use as the benchmark for future photography and episode art.</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "usage" && (
          <div>
            <div className="lbl">Episode Thumbnail Cards</div>
            <div className="row">
              <div className="ep-card">
                <div className="ep-num">EP. 140 / S12</div>
                <div className="ep-title">My <span className="hl">AI Stack</span>, China, and What's Next</div>
              </div>
              <div className="ep-card">
                <div className="ep-num">EP. 141 / S12</div>
                <div className="ep-title">You Can't Put an <span className="hl">AI</span> on a PIP</div>
              </div>
            </div>

            <div className="lbl">Pull Quote Card (Social)</div>
            <div className="pq">
              <p>"The more experience you have, the more valuable AI makes you."</p>
              <cite>The IT XP, theitxp.com</cite>
            </div>

            <div className="lbl">Platform Bios</div>
            <div className="ts">
              <div className="ts-meta">Apple Podcasts / Spotify</div>
              <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 13, lineHeight: 1.6 }}>
                Honest, unfiltered IT career and technology content for experienced sysadmins, engineers, and IT leaders. Hosted by Chuck, 25+ years in the field.
              </div>
            </div>
            <div className="ts">
              <div className="ts-meta">LinkedIn</div>
              <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 13, lineHeight: 1.6 }}>
                Host of The IT XP podcast. 25 years in IT. Covering AI tools, career strategy, and what actually matters for experienced IT professionals.
              </div>
            </div>

            <div className="divider" />
            <div className="note">Version 1.1. Asset review complete. Color system updated to reflect deep navy / electric blue / amber gold sourced from existing assets.</div>
          </div>
        )}
      </div>
    </>
  );
}
