import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#101828",
        mist: "#f4f7fb",
        line: "#d7deea",
        brand: "#0f766e",
        accent: "#0f172a",
      },
      boxShadow: {
        card: "0 20px 45px rgba(15, 23, 42, 0.10)",
      },
    },
  },
  plugins: [],
};

export default config;
