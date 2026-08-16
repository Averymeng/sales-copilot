import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#F6F4F8",
        card: "#FFFFFF",
        ink: "#06040F",
        body: "#564B58",
        muted: "#938BA0",
        line: "#ECEAF1",
        primary: "#5B5BD8",
        "primary-soft": "#EEEAFD",
        ok: "#4FA37A",
        warn: "#C9893F",
        danger: "#C75B5B",
      },
      borderRadius: {
        card: "14px",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "PingFang SC",
          "Microsoft YaHei",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
