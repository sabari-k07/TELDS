/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        grid: {
          950: '#070b14',
          900: '#0b1329',
          800: '#142145',
          700: '#1e3368',
        },
        energy: {
          cyan: '#00f0ff',
          amber: '#f59e0b',
          rose: '#f43f5e',
          emerald: '#10b981',
          indigo: '#6366f1'
        }
      }
    },
  },
  plugins: [],
}
