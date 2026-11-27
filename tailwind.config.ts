import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Figma Design System Tokens
        yellow: {
          50: "#fffbeb",
          100: "#fff3c4",
          200: "#ffe58a",
          500: "#ffc629", // Primary Hinggo brand color
          600: "#e5a800", // Hover / active state
        },
        ink: "#1a1a1a",
        gray: {
          50: "#fbfbfa",
          100: "#f6f6f4",
          200: "#ebebeb",
          300: "#d9d9d9",
          500: "#8a8a8a",
          700: "#4b4b4b",
        },
        success: {
          DEFAULT: "#1f9d55",
          bg: "#e6f6ec",
        },
        danger: {
          DEFAULT: "#d64545",
          bg: "#fcebeb",
        },
      },
      fontFamily: {
        sans: ["var(--font-plus-jakarta)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "20px",
        btn: "12px",
      },
      boxShadow: {
        card: "0 4px 20px -2px rgba(0, 0, 0, 0.05)",
        hover: "0 10px 25px -4px rgba(0, 0, 0, 0.08)",
      },
    },
  },
  plugins: [],
};
export default config;
