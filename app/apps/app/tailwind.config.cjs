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
      keyframes: {
        "fade-out": {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        shimmer: {
          "100%": {
            transform: "translateX(100%)",
          },
        },
      },
      animation: {
        "fade-out-slow": "fade-out 3s linear",
        "fade-out-fast": "fade-out 0.5s linear",
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/aspect-ratio"), require("@headlessui/tailwindcss")],
};
