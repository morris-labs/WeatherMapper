/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {},
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        '.safe-area-bottom': { 'padding-bottom': 'env(safe-area-inset-bottom, 0)' },
      });
    },
  ],
};
