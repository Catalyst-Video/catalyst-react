const postcss = require('rollup-plugin-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const strip = require('@rollup/plugin-strip');
const files = require('rollup-plugin-import-file');
const copy = require('rollup-plugin-copy');

module.exports = {
  rollup(config, options) {
    config.plugins.push(
      files({
        output: 'dist/assets/files',
        extensions: '.mp3',
        hash: true,
      }),
      copy({
        targets: [{ src: 'src/assets/sound', dest: 'dist/assets' }],
      }),
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

      strip({
        labels: ['unittest'],
      })
    );
    return config;
  },
};
