/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Palette SMART-PAIE — inspirée des couleurs du Burkina Faso
        brand: {
          50:  "#fef7e0",
          100: "#fdecb0",
          200: "#fbd97d",
          300: "#f9c64a",
          400: "#f7b725",
          500: "#f5a50b",   // Jaune or — couleur principale
          600: "#d4850a",
          700: "#a96209",
          800: "#7d4307",
          900: "#512b04",
        },
        danger: {
          50:  "#fef2f2",
          500: "#ef4444",
          600: "#dc2626",
          700: "#b91c1c",
        },
        success: {
          50:  "#f0fdf4",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Menlo", "monospace"],
      },
      boxShadow: {
        card: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        "card-hover": "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
      },
    },
  },
  plugins: [],
};
