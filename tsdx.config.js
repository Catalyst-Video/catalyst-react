const postcss = require('rollup-plugin-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const strip = require('@rollup/plugin-strip');
const copy = require('rollup-plugin-copy');

module.exports = {
  rollup(config, options) {
    config.plugins.push(
      postcss({
        plugins: [
          autoprefixer(),
          cssnano({
            preset: 'default',
          }),
        ],
        // Append to <head /> as code running
        inject: true, // false
        // only write out CSS for the first bundle (avoids pointless extra files): -> make false if we inject true
        extract: false, // !!options.writeMeta,
      }),
      copy({
        targets: [{ src: 'src/assets/sound', dest: 'dist/assets' }],
        copyOnce: true,
        verbose: true,
      })
      // strip({
      //   labels: ['unittest'],
      // })
    );
    return config;
  },
};
