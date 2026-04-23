import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "synergy-gray":         "#e8e6e0",
        "synergy-dark":         "#1c1c1a",
        "synergy-navy":         "#1a2f4a",
        "synergy-muted":        "#6b6b65",
        "synergy-rule":         "#c8c4bc",
        "synergy-amber":        "#c17f24",
        "synergy-amber-light":  "#fdf3e0",
        "synergy-white":        "#f5f3ee",
        "synergy-green":        "#2d5a3d",
        "synergy-green-light":  "#e8f0eb",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      spacing: {
        nav: "52px",
        ticker: "32px",
      },
      height: {
        nav: "52px",
        ticker: "32px",
      },
      maxWidth: {
        content: "1128px",
      },
      keyframes: {
        tickerScroll: {
          from: { transform: "translateX(0)" },
          to:   { transform: "translateX(-50%)" },
        },
        navFlicker: {
          "0%, 88%, 90%, 92%, 94%, 100%": { opacity: "1" },
          "89%":  { opacity: "0.97" },
          "91%":  { opacity: "0.99" },
          "93%":  { opacity: "0.95" },
        },
        fadeInUp: {
          from: { opacity: "0", transform: "translateY(6px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        ticker:    "tickerScroll 38s linear infinite",
        flicker:   "navFlicker 9s ease-in-out infinite",
        "fade-in": "fadeInUp 0.5s ease-out forwards",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
