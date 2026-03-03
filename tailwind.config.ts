import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-nunito)", "system-ui", "sans-serif"],
      },
      colors: {
        duo: {
          green: "#58CC02",
          "green-hover": "#4CAF00",
          blue: "#1CB0F6",
          "blue-hover": "#1899D6",
          orange: "#FF9600",
          "orange-hover": "#E68600",
          red: "#FF4B4B",
          "red-hover": "#E04040",
          gray: "#4B4B4B",
          "gray-light": "#757575",
          "gray-bg": "#F7F7F7",
        },
      },
    },
  },
  plugins: [],
};
export default config;
