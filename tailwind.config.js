const defaultTheme = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        Rubik: ["Rubik", ...defaultTheme.fontFamily.sans],
        title: ["Rubik", ...defaultTheme.fontFamily.sans],
        body: ["Nunito", ...defaultTheme.fontFamily.sans],
      },
    },
  },
  safelist: [
    {
      pattern: /grid-cols-*/,
    },
  ],
  plugins: [],
};
