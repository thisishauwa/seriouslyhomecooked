/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./index.tsx",
    "./App.tsx",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./services/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['EB Garamond', 'serif'],
      },
      colors: {
        brand: {
          sage: '#4A5D4E',
          cream: '#FDFBF7',
          terracotta: '#C17D5C',
          ink: '#1A1C19',
          gold: '#B08D57',
          clay: '#F2F2F2'
        }
      },
      borderRadius: {
        'lg': '8px',
        'DEFAULT': '4px',
      }
    },
  },
  plugins: [],
}

