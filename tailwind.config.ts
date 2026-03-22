import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
        gothic: ["var(--font-display-gothic)", "serif"],
        retro: ["var(--font-display-retro)", "sans-serif"],
        vapor: ["var(--font-display-vapor)", "sans-serif"],
        whimsy: ["var(--font-display-whimsy)", "serif"],
        luxe: ["var(--font-display-luxe)", "serif"],
      },
      boxShadow: {
        ritual: "0 20px 50px rgba(9, 8, 20, 0.2)",
      },
      keyframes: {
        flip: {
          "0%": { transform: "rotateY(0deg)" },
          "100%": { transform: "rotateY(180deg)" },
        },
        revealPulse: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(255,255,255,0)" },
          "50%": { boxShadow: "0 0 0 6px rgba(255,255,255,0.2)" },
        },
      },
      animation: {
        flip: "flip 650ms cubic-bezier(0.3, 0.7, 0.2, 1)",
        revealPulse: "revealPulse 1.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
