//postcss.config.js
module.exports = {
  plugins: [
    require('postcss-import'),
    // require('tailwindcss/nesting')(require('postcss-nesting')),
    require('tailwindcss'),
    require('autoprefixer'),
    require('cssnano')({
      preset: 'default',
    }),
    // require('postcss-nested')({ bubble: ['screen'] }),
  ],
};
