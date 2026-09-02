import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        void: "#0A0908",
        panel: "#14120F",
        panel2: "#1C1914",
        gold: "#C9A227",
        goldLight: "#E8C766",
        goldDim: "#7A6423",
        ivory: "#EDE6D6",
        bronze: "#8A7148",
        emerald: "#1F3D2E",
        emeraldLight: "#4CAF7D",
        garnet: "#3D1518",
        garnetLight: "#C1615F",
        line: "#3A331F",
      },
      fontFamily: {
        display: ["var(--font-cinzel)", "serif"],
        body: ["var(--font-spectral)", "serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      letterSpacing: {
        wider2: "0.18em",
        wider3: "0.28em",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideInLeft: {
          "0%": { opacity: "0", transform: "translateX(-100%)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        glow: {
          "0%, 100%": { opacity: "0.15" },
          "50%": { opacity: "0.35" },
        },
        ripple: {
          "0%": { transform: "scale(0)", opacity: "0.55" },
          "100%": { transform: "scale(16)", opacity: "0" },
        },
        popBounce: {
          "0%": { transform: "scale(0.88)" },
          "45%": { transform: "scale(1.08)" },
          "100%": { transform: "scale(1)" },
        },
      },
      animation: {
        fadeUp: "fadeUp 0.9s ease-out both",
        fadeIn: "fadeIn 0.25s ease-out both",
        slideInLeft: "slideInLeft 0.3s ease-out both",
        glow: "glow 6s ease-in-out infinite",
        ripple: "ripple 0.5s ease-out forwards",
        popBounce: "popBounce 0.35s cubic-bezier(0.34,1.56,0.64,1) both",
      },
    },
  },
  plugins: [],
};

export default config;
