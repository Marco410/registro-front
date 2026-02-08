import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        orange: {
          50: '#FFF3EB',
          100: '#FFE0CC',
          200: '#FFD1B3',
          300: '#FFB47E',
          400: '#FFA366',//'#228be6',
          500: '#f7945e',
          600: '#E07C3A',
          700: '#C96B2C',
          800: '#A8561F',
          900: '#7A3A0F',
        },
        green: {
          50: '#E6F4EA',
          100: '#CDE9D5',
          200: '#A8D5BA',
          300: '#7FC39C',
          400: '#5BAA7B',
          500: '#3B8C5A',
          600: '#2C6B44',
          700: '#1D4A2E',
          800: '#11301B',
          900: '#06170A',
        },
        brown: {
          50: '#F5F3F1',
          100: '#E9E3DF',
          200: '#CFC0B7',
          300: '#B39C8C',
          400: '#8C6B4B',
          500: '#6B4B2C',
          600: '#4A2E1D',
          700: '#301B11',
          800: '#170A06',
          900: '#0A0603',
        },
      },
      fontFamily: {
        sans: ['Poppins', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;

