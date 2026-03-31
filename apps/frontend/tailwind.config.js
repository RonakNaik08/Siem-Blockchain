import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}"
  ],

  theme: {
    extend: {
      colors: {
        background: "#0b1220",
        surface: "#111827",
        border: "#1f2937",
        primary: "#3b82f6",
        danger: "#ef4444",
        success: "#22c55e"
      },

      fontFamily: {
        mono: ["ui-monospace", "monospace"]
      },

      boxShadow: {
        card: "0 0 0 1px rgba(31,41,55,0.5)"
      },

      borderRadius: {
        xl: "12px"
      }
    }
  },

  plugins: []
};

export default config;