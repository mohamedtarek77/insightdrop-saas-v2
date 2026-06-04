/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Fraunces'", "Georgia", "serif"],
        body:    ["'Outfit'", "sans-serif"],
        mono:    ["'JetBrains Mono'", "monospace"],
      },
      colors: {
        /* semantic tokens that map to CSS vars */
        base:    "var(--bg-base)",
        surface: "var(--bg-surface)",
        raised:  "var(--bg-raised)",

        primary:   "var(--text-primary)",
        secondary: "var(--text-secondary)",
        tertiary:  "var(--text-tertiary)",

        accent: {
          DEFAULT: "var(--accent)",
          light:   "var(--accent-light)",
        },
        gold:  "var(--gold)",
        teal:  "var(--teal)",
        rose:  "var(--rose)",
      },
      borderColor: {
        dim:    "var(--border-dim)",
        mid:    "var(--border-mid)",
        bright: "var(--border-bright)",
      },
      animation: {
        "rise":    "rise 0.55s ease both",
        "shimmer": "shimmer 1.6s infinite",
        "spin-slow":"spin 1.2s linear infinite",
        "blink":   "blink 2.4s ease-in-out infinite",
        "fade-up": "rise 0.5s ease both",
      },
      keyframes: {
        rise: {
          "0%":   { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition:  "200% 0" },
        },
        blink: {
          "0%,100%": { opacity: "0.5" },
          "50%":     { opacity: "1" },
        },
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(.4,0,.2,1)",
      },
    },
  },
  plugins: [],
};
