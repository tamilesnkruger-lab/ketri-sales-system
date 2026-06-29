import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#18212f",
        paper: "#f7f5ef",
        leaf: "#2f7d64",
        coral: "#d65d50",
        maize: "#e3b94d",
        sky: "#4f8fc8"
      },
      boxShadow: {
        soft: "0 18px 45px rgba(24, 33, 47, 0.10)"
      }
    }
  },
  plugins: []
};

export default config;
