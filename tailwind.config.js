const colors = require('tailwindcss/colors');

module.exports = {
  purge: [
    './src/**/*.{js,jsx,ts,tsx}',
    './src/*.{js,jsx,ts,tsx}',
    './public/index.html',
  ],
  // mode: 'jit',
  darkMode: 'class', // or 'media' or 'class'
  important: '#ctw',
  theme: {
    colors: {
      // Build your palette here
      primary: 'var(--ctwPrimary)',
      secondary: 'var(--ctwSecondary)',
      primaryDark: 'var(--ctwPrimaryDark)',
      secondaryDark: 'var(--ctwSecondaryDark)',
      transparent: 'transparent',
      current: 'currentColor',
      white: colors.white,
      black: colors.black,
      gray: colors.coolGray, // coolGray
      red: colors.red[500],
      // orange: colors.orange[500],
      // amber: colors.amber[500],
      // yellow: colors.yellow[500],
      // lime: colors.lime[500],
      // green: colors.green[500],
      // emerald: colors.emerald[500],
      // teal: colors.teal[500],
      // cyan: colors.cyan[500],
      // sky: colors.sky[500],
      // blue: colors.blue[500],
      // indigo: colors.indigo[500],
      // violet: colors.violet[500],
      // purple: colors.purple[500],
      // fuchsia: colors.fuchsia[500],
      // pink: colors.pink[500],
      // rose: colors.rose[500],
    },
    extend: {
      keyframes: {
        'fade-in-down': {
          '0%': {
            opacity: '0',
            transform: 'translateY(-10px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        'fade-out-down': {
          from: {
            opacity: '1',
            transform: 'translateY(0px)',
          },
          to: {
            opacity: '0',
            transform: 'translateY(10px)',
          },
        },
        'fade-in-up': {
          '0%': {
            opacity: '0',
            transform: 'translateY(10px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        'fade-out-up': {
          from: {
            opacity: '1',
            transform: 'translateY(0px)',
          },
          to: {
            opacity: '0',
            transform: 'translateY(10px)',
          },
        },
        'fade-in-right': {
          from: {
            opacity: '0',
            transform: 'translateX(20px)',
          },
          to: {
            opacity: '1',
            transform: 'translateX(0px)',
          },
        },
        'fade-in-left': {
          from: {
            opacity: '0',
            transform: 'translateX(-20px)',
          },
          to: {
            opacity: '1',
            transform: 'translateX(0px)',
          },
        },
      },
      animation: {
        'fade-in-down': 'fade-in-down 0.35s ease-out',
        'fade-out-down': 'fade-out-down 0.35s ease-out',
        'fade-in-up': 'fade-in-up 0.35s ease-out',
        'fade-out-up': 'fade-out-up 0.35s ease-out',
        'fade-in-right': 'fade-in-right 0.35s ease-out',
        'fade-in-left': 'fade-in-left 0.35s ease-out',
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [require('@tailwindcss/aspect-ratio')],
};
