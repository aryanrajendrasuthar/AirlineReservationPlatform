/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        airline: {
          navy: '#003087',
          gold: '#C9A227',
          'gold-light': '#F0C040',
          'navy-light': '#0045A0',
          'navy-dark': '#001F5A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
