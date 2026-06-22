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
          light: '#60A5FA', // Light Blue
          DEFAULT: '#3B82F6', // Blue
          dark: '#2563EB', // Dark Blue
          accent: '#22D3EE', // Cyan Accent
        },
        navy: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
          950: '#030712', // Very dark slate/navy
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
