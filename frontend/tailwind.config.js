// frontend/tailwind.config.js (в корне frontend/)
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'gray-900': '#111827',
        'purple-900': '#6b21a8',
        'indigo-900': '#4f46e5',
        'purple-600': '#9333ea',
        'pink-600': '#ec4899',
        'purple-700': '#6b21a8',
        'indigo-400': '#818cf8',
        'pink-400': '#f472b6',
        'amber-300': '#fcd34d',
        'emerald-300': '#6ee7b7',
        'red-400': '#f87171',
        'orange-400': '#fb923c',
        'yellow-400': '#fbbf24',
        'blue-400': '#60a5fa',
        'gray-400': '#9ca3af',
        'gray-500': '#6b7280',
        'gray-800': '#1f2937',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};