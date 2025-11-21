/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#FFF4ED',
          100: '#FFE6D5',
          200: '#FFC9AA',
          300: '#FFA574',
          400: '#FF7A3C',
          500: '#FF6B35',
          600: '#F04E1A',
          700: '#C73A11',
          800: '#9E3016',
          900: '#7F2C15',
        },
        secondary: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#004E89',
          600: '#003D6B',
          700: '#002D4E',
          800: '#001D33',
          900: '#001322',
        },
      },
    },
  },
  plugins: [],
}