const postcss = require('rollup-plugin-postcss');
const strip = require('@rollup/plugin-strip');
// Not transpiled with TypeScript or Babel, so use plain Es6/Node.js
const replace = require('@rollup/plugin-replace');
// const url = require('@ rollup/plugin-url');
// const copy = require('rollup-plugin-copy');

module.exports = {
  rollup(config, opts) {
    config.plugins.push(
      postcss({
        config: {
          path: './postcss.config.js',
        },
        extensions: ['.css'],
        minimize: true,
        inject: {
          // Append to <head /> as code running
          insertAt: 'top',
          // only write out CSS for the first bundle (avoids pointless extra files): -> make false if we inject true
        },
      }),
      strip({
        labels: ['unittest'],
      }),
      // TODO: necessary for audio files
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
      //   limit: 0,
      // }),
      // copy({
      //   targets: [{ src: 'src/assets/sounds', dest: 'dist/assets' }],
      //   copyOnce: true,
      //   verbose: true,
      // })
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
