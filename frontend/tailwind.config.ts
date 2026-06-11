import type { Config } from "tailwindcss";



const config: Config = {

  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],

  theme: {

    extend: {

      colors: {

        primary: {

          DEFAULT: "#2C4A1E",

          light: "#3A6128",

          dark: "#243D18",

        },

        accent: {

          DEFAULT: "#B8930A",

          light: "#D4A820",

          dark: "#8B6914",

        },

        earth: {

          DEFAULT: "#3D2B18",

          light: "#7A6550",

        },

        linen: {

          DEFAULT: "#FAF7F0",

          dark: "#F0EAD8",

          deep: "#E8E0D0",

        },

        midnight: "#1C1408",

        forest: { DEFAULT: "#2C4A1E", light: "#3A6128", dark: "#243D18" },

        gold: { DEFAULT: "#B8930A", light: "#D4A820", dark: "#8B6914" },

        cream: { DEFAULT: "#FAF7F0", dark: "#F0EAD8" },

        brand: {

          50: "rgba(44, 74, 30, 0.06)",

          100: "rgba(44, 74, 30, 0.1)",

          200: "rgba(44, 74, 30, 0.18)",

          400: "#3A6128",

          500: "#2C4A1E",

          600: "#2C4A1E",

          700: "#2C4A1E",

          800: "#243D18",

          900: "#1C1408",

        },

      },

      fontFamily: {

        sans: ["var(--font-dm-sans)", "system-ui", "sans-serif"],

        display: ["var(--font-cormorant)", "Georgia", "serif"],

      },

      boxShadow: {

        card: "0 2px 8px rgba(28,20,8,0.06), 0 8px 24px rgba(28,20,8,0.04)",

        "card-hover": "0 12px 40px rgba(28,20,8,0.12), 0 4px 12px rgba(184,147,10,0.12)",

        premium: "0 20px 60px rgba(28,20,8,0.1)",

        gold: "0 4px 24px rgba(184,147,10,0.35)",

      },

    },

  },

  plugins: [],

};



export default config;


