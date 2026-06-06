import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#9fe870",
        "primary-active": "#cdffad",
        canvas: "#ffffff",
        "canvas-soft": "#e8ebe6",
        ink: "#0e0f0c",
        body: "#454745",
        mute: "#868685",
        positive: "#2ead4b",
        negative: "#d03238",
      },
      borderRadius: {
        xl: "24px",
      },
      fontWeight: {
        black: "900",
      }
    },
  },
  plugins: [],
};
export default config;
