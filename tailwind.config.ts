import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(1.25rem)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-scale": {
          "0%": { opacity: "0", transform: "scale(0.8)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "fade-in-scale-spring": {
          "0%": { opacity: "0", transform: "scale(0.5)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.6s ease-out forwards",
        "fade-in-scale": "fade-in-scale 0.6s ease-out 0.2s forwards",
        "fade-in-scale-spring": "fade-in-scale-spring 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s forwards",
        "fade-in-up-4": "fade-in-up 0.6s ease-out 0.4s forwards",
        "fade-in-up-5": "fade-in-up 0.6s ease-out 0.5s forwards",
      },
      colors: {
        // Paleta tipo Material (blanco, grises, azul primario)
        app: {
          surface: "#F8F9FA",
          sidebar: "#FFFFFF",
          selected: "#E8F0FE",
          primary: "#1A73E8",
          "primary-muted": "#8AB4F8",
          "text-primary": "#202124",
          "text-secondary": "#5F6368",
        },
        brown: {
          50: "#faf8f6",
          100: "#f5f0eb",
          200: "#e8dfd5",
          300: "#d4c4b0",
          400: "#b8a088",
          500: "#9c7d66",
          600: "#7d6452",
          700: "#634f41",
          800: "#4a3b31",
          900: "#322922",
        },
        black: {
          100: "#f1f1f1",
          200: "#e5e5e5",
          300: "#c4c4c4",
          400: "#a3a3a3",
          500: "#737373",
          600: "#525252",
          700: "#404040",
          800: "#262626",
          900: "#171717",
        },
      },
    },
  },
  plugins: [],
};

export default config;
