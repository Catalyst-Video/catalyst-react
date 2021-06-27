const postcss = require('rollup-plugin-postcss');
const autoprefixer = require('autoprefixer');
const tailwindcss = require('tailwindcss');
const cssnano = require('cssnano');
const strip = require('@rollup/plugin-strip');
// Not transpiled with TypeScript or Babel, so use plain Es6/Node.js
const replace = require('@rollup/plugin-replace');
const nesting = require('postcss-nested');
//require('tailwindcss/nesting');
// const copy = require('rollup-plugin-copy');
// const url = require('@rollup/plugin-url');

module.exports = {
  rollup(config, opts) {
    config.plugins.push(
      // url({
      //   include: [
      //     '**/*.svg',
      //     '**/*.png',
      //     '**/*.jp(e)?g',
      //     '**/*.gif',
      //     '**/*.webp',
      //     '**/*.mp3',
      //   ],
      //   destDir: 'dist/assets',
      // }),
      postcss({
        config: {
          path: './postcss.config.js',
        },
        extensions: ['.css'],
        minimize: true,
        inject: {
          insertAt: 'top',
        },
      }),
      /*    plugins: [
          tailwindcss(),
          autoprefixer(),
          nesting(),
          cssnano({
            preset: 'default',
          }),
        ],
        // Append to <head /> as code running
        inject: true, // false
        // only write out CSS for the first bundle (avoids pointless extra files): -> make false if we inject true
        extract: false, // !!options.writeMeta,
      }),
      // copy({
      //   targets: [{ src: 'src/assets/sound', dest: 'dist/assets' }],
      //   copyOnce: true,
      //   verbose: true,
      // }), */
      strip({
        labels: ['unittest'],
      })
    );
    config.plugins = config.plugins.map(p =>
      p.name === 'replace'
        ? replace({
            'process.env.NODE_ENV': JSON.stringify(opts.env),
            preventAssignment: true,
          })
        : p
    );
    return config;
  },
};
