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
      animation: {
        text: "text 5s ease infinite",
      },
      keyframes: {
        text: {
          "0%, 100%": {
            "background-size": "200% 200%",
            "background-position": "left center",
          },
          "50%": {
            "background-size": "200% 200%",
            "background-position": "right center",
          },
        },
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
