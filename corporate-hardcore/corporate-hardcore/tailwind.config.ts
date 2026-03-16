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
        "linkedin-blue": {
          DEFAULT: "var(--linkedin-blue)",
          hover: "var(--linkedin-hover)",
        },
        "card-bg": "var(--card-bg)",
        "bg-main": "var(--bg-main)",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "border-light": "var(--border-light)",
        "border-medium": "var(--border-medium)",
        "btn-secondary": "var(--button-secondary)",
      },
      spacing: { nav: "52px" },
      height: { nav: "52px" },
      width: { "content": "1128px" },
      boxShadow: {
        card: "0 0 0 1px rgba(0,0,0,.15), 0 2px 3px rgba(0,0,0,.05)",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
export default config;
