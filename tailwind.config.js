const defaultTheme = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,jsx,ts,tsx,md,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        // For titles and important things
        Rubik: ["Rubik", ...defaultTheme.fontFamily.sans],
        title: ["Rubik", ...defaultTheme.fontFamily.sans],
        // Next are to override defaults for body and normal
        sans: ["Nunito", ...defaultTheme.fontFamily.sans],
        body: ["Nunito", ...defaultTheme.fontFamily.sans],
      },
    },
  },
  safelist: [
    {
      pattern: /grid-cols-*/,
    },
    {
      pattern: /grid-rows-*/,
    },
  ],
  plugins: [require("@tailwindcss/typography")],
};
