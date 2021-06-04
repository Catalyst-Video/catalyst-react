const colors = require('tailwindcss/colors');

module.exports = {
  purge: [
    './src/**/*.{js,jsx,ts,tsx}',
    './src/*.{js,jsx,ts,tsx}',
    './public/index.html',
  ],
  // mode: 'jit',
  darkMode: 'class', // or 'media' or 'class'
  theme: {
    colors: {
      // Build your palette here
      transparent: 'transparent',
      current: 'currentColor',
      white: colors.white,
      black: colors.black,
      gray: colors.coolGray,
      red: colors.red[500],
      orange: colors.orange[500],
      amber: colors.amber[500],
      yellow: colors.yellow[500],
      lime: colors.lime[500],
      green: colors.green[500],
      emerald: colors.emerald[500],
      teal: colors.teal[500],
      cyan: colors.cyan[500],
      lightBlue: colors.lightBlue[500],
      blue: colors.blue[500],
      indigo: colors.indigo[500],
      violet: colors.violet[500],
      purple: colors.purple[500],
      fuchsia: colors.fuchsia[500],
      pink: colors.pink[500],
      rose: colors.rose[500],
    },
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [require('@tailwindcss/aspect-ratio')],
};
