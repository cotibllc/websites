/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./www/**/*.html",
    "./www/**/*.js",
    "./api/**/*.js"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          light: '#4ADE80', // Green 400
          DEFAULT: '#22C55E', // Green 500 — terminal green
          dark: '#16A34A', // Green 600
        },
        ink: {
          50: '#FAFAFA',
          100: '#F4F4F5',
          200: '#E4E4E7',
          300: '#D4D4D8',
          400: '#A1A1AA',
          500: '#71717A',
          600: '#52525B',
          700: '#3F3F46',
          800: '#27272A',
          900: '#18181B',
          950: '#0A0A0A' // Near-black brand background
        }
      },
      fontFamily: {
        sans: ['Space Grotesk', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'SFMono-Regular', 'Menlo', 'monospace'],
      }
    },
  },
  plugins: [],
}
