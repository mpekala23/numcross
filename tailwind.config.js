/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  safelist: [
    {
      pattern: /grid-cols-*/,
    }
  ],
  plugins: [],
}
