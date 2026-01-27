/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#f59e0b', // amber-500
          secondary: '#1f2937', // gray-800
        },
        cs: {
          orange: '#e9b10e', // CS2 UI Gold
          blue: '#5d79ae',   // CT Blue-Grey
          dark: '#0b0f12',   // Deep background
          surface: '#141619', // Card background
          text: '#b8b8b8'    // Muted text
        }
      }
    },
  },
  plugins: [],
}
