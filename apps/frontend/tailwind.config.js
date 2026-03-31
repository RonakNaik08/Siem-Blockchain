/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/app/apps/frontend/src/**/*.{js,ts,jsx,tsx}", // 🔥 IMPORTANT
    "./components/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    extend: {
      colors: {
        background: "#020817",
        surface: "#0a0f1e",
        "surface-2": "#0d1424",
        border: "#1e293b",
        primary: "#22d3ee",
        "primary-dim": "#0891b2",
        secondary: "#818cf8",
        accent: "#a78bfa",
        danger: "#f87171",
        success: "#34d399",
        warning: "#fbbf24",
      },

      boxShadow: {
        card: "0 4px 32px rgba(0, 0, 0, 0.6)",
      },

      fontFamily: {
        mono: ["ui-monospace", "SFMono-Regular", "monospace"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },

  plugins: [],
};