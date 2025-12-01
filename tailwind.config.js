/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.{html,js}"], // Scans all HTML and JS files in the folder
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none', // Prevents prose from constraining width too much
          },
        },
      },
    },
  },
  plugins: [], // You might need '@tailwindcss/typography' if you use the prose class extensively
}