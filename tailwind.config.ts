/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#000000", // Pure Black [cite: 31]
        foreground: "#FFFFFF", // Pure White [cite: 32]
        'money-green': "#00FF41", // Matrix Green [cite: 33]
      },
      fontFamily: {
        mono: ['Courier New', 'Courier', 'monospace'], // Terminal Vibe 
      },
    },
  },
  plugins: [],
}