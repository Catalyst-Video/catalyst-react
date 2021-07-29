const colors = require('tailwindcss/colors');

module.exports = {
  purge: [
    './src/**/*.{js,jsx,ts,tsx}',
    './src/*.{js,jsx,ts,tsx}',
    './public/index.html',
  ],
  // mode: 'jit',
  darkMode: 'class', // or 'media'
  important: '#ctw',
  theme: {
    colors: {
      primary: 'var(--ctwPrimary)', // accent color
      secondary: 'var(--ctwSecondary)', // background color
      tertiary: 'var(--ctwTertiary)', // button/element color
      quaternary: 'var(--ctwQuaternary)', // hover color for buttons/elements
      transparent: 'transparent',
      current: 'currentColor',
      white: colors.white,
      black: colors.black,
      gray: colors.coolGray, 
      red: '#F64F59' // colors.red[500],
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
        'fade-in-down': 'fade-in-down 0.20s ease-out',
        'fade-out-down': 'fade-out-down 0.20s ease-out',
        'fade-in-up': 'fade-in-up 0.20s ease-out',
        'fade-out-up': 'fade-out-up 0.20s ease-out',
        'fade-in-right': 'fade-in-right 0.25s ease-out',
        'fade-in-left': 'fade-in-left 0.25s ease-out',
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [require('@tailwindcss/aspect-ratio')],
};
