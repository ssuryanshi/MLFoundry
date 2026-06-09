/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        terminal: {
          bg:        "#0C0C0C",
          green:     "#00FF41",
          amber:     "#FFB000",
          dim:       "#005F1B",
          gray:      "#4A4A4A",
          white:     "#E0E0E0",
          red:       "#FF3333",
          cyan:      "#00FFFF",
          selection: "#1A3A1A",
        }
      },
      fontFamily: {
        mono: ["'JetBrains Mono'", "'Fira Code'", "Consolas", "monospace"],
      },
    },
  },
  plugins: [],
}