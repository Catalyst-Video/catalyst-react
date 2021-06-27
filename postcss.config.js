//postcss.config.js
module.exports = {
  plugins: [
    require('postcss-import'),
    // require('tailwindcss/nesting')(require('postcss-nesting')),
    require('tailwindcss'),
    require('autoprefixer'),
    // require('postcss-nested')({ bubble: ['screen'] }),
    // postcss([require('postcss-nested')({ bubble: ['screen'] })]),
  ],
};
