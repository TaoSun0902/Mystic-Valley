import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./store/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ember: "#f97316",
        moss: "#4d7c0f",
        obsidian: "#080b0f"
      },
      boxShadow: {
        rune: "0 0 32px rgba(249, 115, 22, 0.28)"
      }
    }
  },
  plugins: []
};

export default config;
