import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        schoolgle: {
          hr: "#ADD8E6",
          finance: "#FFAA4C",
          estates: "#00D4D4",
          gdpr: "#FFD700",
          compliance: "#E6C3FF",
          teaching: "#FFB6C1",
          send: "#98FF98"
        }
      }
    }
  },
  plugins: []
};

export default config;
