import type { Config } from "tailwindcss";

export default {
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

        foregroundHighlighted: "var(--foregroundHighlighted)",
        foregroundGrey: "var(--foregroundGrey)",

        placeholder: "var(--placeholder)",

        backgroundBox: "var(--backgroundBox)",
        backgroundBoxHover: "var(--backgroundBoxHover)",
        backgroundBoxBox: "var(--backgroundBoxBox)",
        backgroundBoxBoxHover: "var(--backgroundBoxBoxHover)",
        backgroundBoxBoxHighlighted: "var(--backgroundBoxBoxHighlighted)",
        backgroundBoxBoxHighlightedHover: "var(--backgroundBoxBoxHighlightedHover)",
        backgroundWhiteClock: "var(--backgroundWhiteClock)",
        backgroundBlackClock: "var(--backgroundBlackClock)",

        border: "var(--border)",
        borderHighlighted: "var(--borderHighlighted)",

        blackBoard: "var(--blackBoard)",
        whiteBoard: "var(--whiteBoard)",
      },
      borderRadius: {
        borderRoundness: "var(--borderRoundness)",
        borderExtraRoundness: "var(--borderExtraRoundness)",
      },
      boxShadow: {
        shadowBoxBoxHighlighted: "var(--shadowBoxBoxHighlighted) var(--backgroundBoxBoxHighlightedHover)",
      },
    },
  },
  plugins: [],
} satisfies Config;
