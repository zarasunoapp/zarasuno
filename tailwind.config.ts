import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#0B5D4B",
          50: "#E8F0EA",
          100: "#CFE1D5",
          200: "#A3C6B2",
          300: "#6FA88E",
          400: "#3C8A6A",
          500: "#0B5D4B",
          600: "#0A5041",
          700: "#083E33",
          800: "#052C24",
          900: "#031D18",
        },
        gold: {
          DEFAULT: "#D9A94C",
          50: "#FAF3E0",
          100: "#F3E4BC",
          200: "#EACF8C",
          300: "#E1BB5E",
          400: "#D9A94C",
          500: "#BE8E30",
          600: "#98701F",
        },
        clay: {
          DEFAULT: "#C97B57",
          50: "#F7ECE5",
          100: "#EBD2C4",
          200: "#DCAF97",
        },
        cream: "#F2E9D5",
        ivory: "#F7F3EA",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
      },
      boxShadow: {
        card: "0 10px 34px -14px rgba(11, 93, 75, 0.22)",
        cardHover: "0 26px 55px -18px rgba(11, 93, 75, 0.38)",
        soft: "0 2px 14px rgba(20, 33, 29, 0.07)",
        glow: "0 24px 70px -24px rgba(11, 93, 75, 0.5)",
        btn: "0 12px 26px -10px rgba(11, 93, 75, 0.55)",
        gold: "0 14px 32px -12px rgba(217, 169, 76, 0.6)",
      },
      backgroundImage: {
        "gold-grad": "linear-gradient(135deg, #E4C169 0%, #D9A94C 55%, #C0902F 100%)",
        "green-grad": "linear-gradient(135deg, #0E6E58 0%, #0B5D4B 55%, #083E33 100%)",
        "hero-mesh":
          "radial-gradient(60% 60% at 15% 10%, rgba(62,138,106,0.35) 0%, transparent 60%), radial-gradient(50% 50% at 85% 20%, rgba(217,169,76,0.22) 0%, transparent 55%), radial-gradient(70% 70% at 70% 100%, rgba(11,93,75,0.5) 0%, transparent 60%)",
      },
      borderRadius: {
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.9)", opacity: "0.7" },
          "100%": { transform: "scale(1.6)", opacity: "0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out both",
        "pulse-ring": "pulse-ring 1.4s ease-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
