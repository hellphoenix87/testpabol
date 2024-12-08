const defaultTheme = require("tailwindcss/defaultTheme");

/* For the accordeons, we use material-tailwind. material-tailwind requires to use withMT as a wrapper here, which destroys the CSS. */

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}", "../frontend/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter var", ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/aspect-ratio"), require("@tailwindcss/line-clamp"), require('@headlessui/tailwindcss')],
};
