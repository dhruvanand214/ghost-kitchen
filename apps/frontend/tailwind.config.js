/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0B0F14",
        panel: "#111827",
        border: "#1F2937",
        accent: "#6366F1"
      }
    }
  },
  plugins: []
};

