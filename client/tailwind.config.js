/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        modal: {
          '0%': { opacity: '0', transform: 'translate(0, 1rem) scale(0.95)' },
          '100%': { opacity: '1', transform: 'translate(0, 0) scale(1)' }
        }
      },
      animation: {
        modal: 'modal 0.3s ease-out forwards'
      }
    },
  },
  plugins: [],
}
