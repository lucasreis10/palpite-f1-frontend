/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        f1: {
          red: '#E10600',
          'red-dark': '#B30500',
          black: '#15151E',
          gray: '#38383F',
          'gray-light': '#F8F4F4',
        },
      },
    },
  },
  plugins: [],
}; 